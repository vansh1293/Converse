import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import {
  setIncomingCall,
  setIncomingOffer,
  setCallerData,
  setCallAccepted,
  setCallRejected,
  setOutgoingCall,
  setCallerID,
  setAnswerOffer,
} from "./callSlice";
import { create } from "domain";
import { get } from "http";
import {
  createDB,
  writeKeysToDB,
  getKeysFromDB,
  generateKeyPair,
} from "../../lib/crypto";

const initialState = {
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingUser: false,
  error: null,
  socket: null,
  onlineUsers: [],
  message: null,
  private_key: null,
  public_key: null,
  deviceID: null,
  isSettingEncryption: false,
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (navigate, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/check");
      navigate("/");
      return { authUser: res.data };
    } catch (err) {
      console.error("Error in checkAuth:", err?.response?.data || err.message);
      return rejectWithValue(
        err?.response?.data || { message: "Unauthorized access" },
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ data, toast }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast({
        description: "Profile updated successfully.",
      });
      return { authUser: res.data };
    } catch (err) {
      console.error("Error in updateProfile:", err);
      toast({
        variant: "destructive",
        title: "Error in updating profile",
        description: err.response.data.message,
      });
      return rejectWithValue(
        err.response?.data || { message: "An error occurred" },
      );
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ data, toast }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast({
        title: "Signup successful",
        description: "Please check your email for OTP.",
      });
      return { message: res.data.message };
    } catch (err) {
      console.error("Error in signup:", err);
      toast({
        variant: "destructive",
        title: "Error in Signup",
        description: err.response.data.message,
      });
      return rejectWithValue({
        message: err.message,
        code: err.code,
        response: err.response?.data || null,
      });
    }
  },
);

export const setEncryption = createAsyncThunk(
  "auth/setEncryption",
  async (id, { rejectWithValue }) => {
    try {
      
      // 1. Check if keys already exist
      const storedKeys = await getKeysFromDB(id);

      if (storedKeys) {
        return {
          privateKey: storedKeys.privateKey,
          publicKey: storedKeys.publicKey,
          deviceID: storedKeys.deviceID,
          reused: true,
        };
      }

      // 2. Generate new keys
      const keyPair = generateKeyPair();

      // 3. Send public key to server
      const res = await axiosInstance.post("/auth/store-public-key", {
        publicKey: keyPair.publicKey,
        device: navigator.userAgent,
      });

      const deviceID = res.data.deviceID;

      // 4. Store keys locally
      await writeKeysToDB(id, keyPair.privateKey, keyPair.publicKey, deviceID);

      return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        deviceID,
        reused: false,
      };
    } catch (err) {
      console.error("Error in setEncryption:", err);

      return rejectWithValue({
        message: "Failed to set up encryption",
        error: err,
      });
    }
  },
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ data, toast, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      const authUser = res.data;

      // Dispatch connectSocket after successful login
      await dispatch(setAuthUser(authUser)); // Set the user in state immediately
      await dispatch(setEncryption(authUser.id));
      await dispatch(connectSocket());
      toast({
        title: "verification successful",
        description: "You are now logged in.",
      });
      navigate("/");
      return { authUser };
    } catch (err) {
      console.error("Error in verifyOTP:", err);
      toast({
        variant: "destructive",
        title: "Error in OTP verification",
        description: err.response.data.message,
      });
      return rejectWithValue(
        err?.response?.data || { message: "An error occurred" },
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ data, toast, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const authUser = res.data;

      // Dispatch connectSocket after successful login
      await dispatch(setAuthUser(authUser)); // Set the user in state immediately
      await dispatch(setEncryption(authUser.id));
      await dispatch(connectSocket());
      toast({
        title: "Login successful",
        description: "You are now logged in.",
      });
      navigate("/");
      return { authUser };
    } catch (err) {
      console.error("Error in login:", err);
      toast({
        variant: "destructive",
        title: "Error in Login",
        description: err.response.data.message,
      });
      return rejectWithValue(
        err?.response?.data || { message: "Login failed" },
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.post("/auth/logout");
      dispatch(disconnectSocket());
      return { authUser: null };
    } catch (err) {
      console.error("Error in logout:", err);
      return rejectWithValue(err);
    }
  },
);
export const connectSocket = (navigate) => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.authUser && !auth.socket) {
    console.log("Connecting socket...");

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      query: {
        userID: auth.authUser.id,
      },//have to change userid to deviceid for better security
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
      withCredentials: true,
    });
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully.");
    });
    socket.on("getOnlineUsers", (userIds) => {
      dispatch(setOnlineUsers({ onlineUsers: userIds }));
    });
    socket.on("incomingCall", (data) => {
      console.log("Incoming call data:", data);
      dispatch(setIncomingOffer(data.offer));
      dispatch(setCallerID(data.senderID));
      dispatch(setCallerData(data.senderData));
      navigate("/IncomingCall/" + data.senderID);
    });
    socket.on("callAccepted", (data) => {
      dispatch(setCallAccepted(true));
      dispatch(setAnswerOffer(data.answer));
      console.log("Call accepted , consoling from authslice :", data);
    });
    socket.on("callRejected", (data) => {
      console.log("Call rejected:", data);
      dispatch(setCallRejected(true));
      dispatch(setIncomingOffer(null));
      dispatch(setCallerID(null));
      dispatch(setCallerData(null));
      navigate("/");
    });
    socket.on("callEnded", (data) => {
      console.log("Call ended:", data);
    });
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    dispatch(setSocket({ socket }));
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected.");
    });
  }
};

export const disconnectSocket = () => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.socket?.connected) {
    auth.socket.disconnect();
    dispatch(setSocket({ socket: null }));
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload.socket;
    },
    setAuthUser: (state, action) => {
      state.authUser = action.payload; // Set user immediately after login
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload.onlineUsers;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingUser = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authUser = action.payload.authUser;
        action.payload.private_key
          ? (state.private_key = action.payload.private_key)
          : null;
        action.payload.deviceID
          ? (state.deviceID = action.payload.deviceID)
          : null;

        state.isCheckingUser = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingUser = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload.authUser;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        // Avoid overwriting user if already set by setAuthUser
        if (!state.authUser) {
          state.authUser = action.payload.authUser;
        }
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isSigningUp = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
        state.socket = null;
        state.deviceID = null;
        state.private_key = null;
        state.public_key = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        if (!state.authUser) {
          state.authUser = action.payload.authUser;
        }
        state.isLoggingIn = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(setEncryption.fulfilled, (state, action) => {
        state.private_key = action.payload.privateKey;
        state.public_key = action.payload.publicKey;
        state.deviceID = action.payload.deviceID;
        state.isSettingEncryption = false;
      })
      .addCase(setEncryption.rejected, (state, action) => {
        state.error = action.payload;
        state.isSettingEncryption = false;
      })
      .addCase(setEncryption.pending, (state) => {
        // You can set a loading state here if needed
        state.isSettingEncryption = true;
      });
  },
});

export const { setSocket, setAuthUser, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
