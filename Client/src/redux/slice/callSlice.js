import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  answerOffer: null,
  callerID: null,
  callerData: null,
  outgoingCall: false,
  incomingCall: false,
  callAccepted: false,
  callRejected: false,
  callEnded: false,
  incomingOffer: null,
  error: null,
  isCallOn: false,
  receiverSocketID: "",
};

export const generateCall = createAsyncThunk(
  "call/generateCall",
  async ({ toast, offer, id }, { rejectWithValue, getState }) => {
    try {
      const authUser = getState().auth.authUser;

      const senderData = {
        id: authUser.id,
        fullName: authUser.fullName,
        profileImage: authUser.profileImage,
      };

      console.log("id for generateCall: ", id);
      const res = await axiosInstance.post("/message/generateCall", {
        id: id,
        offer: offer,
        senderData: senderData,
      });
      console.log("callUser: ", res.data);
      return {
        receiverID: res.data.receiverID,
        receiverSocketID: res.data.receiverSocketID,
      };
    } catch (err) {
      console.log("error in call: ", err);
      toast({
        variant: "destructive",
        title: "Calling is only available to Online Users",
        description: err.response.data.message,
      });
      return rejectWithValue(err);
    }
  },
);

export const acceptCall = createAsyncThunk(
  "call/acceptCall",
  async ({ toast, answer, id }, { rejectWithValue, getState }) => {
    try {
      const { chat } = getState();
      const res = await axiosInstance.post("/message/acceptCall", {
        id: id,
        answer: answer,
      });
      console.log("acceptCall: ", res.data);
      return;
    } catch (err) {
      console.log("error in acceptCall: ", err);
      toast({
        variant: "destructive",
        title: "Error in accepting call",
        description: err.response.data.message,
      });
      return rejectWithValue(err);
    }
  },
);

export const rejectCall = createAsyncThunk(
  "call/rejectCall",
  async ({ toast, navigate, id }, { rejectWithValue, getState }) => {
    try {
      await axiosInstance.post("/message/rejectCall", {
        id: id,
      });
      navigate("/");
      return;
    } catch (err) {
      console.log("error in rejectCall: ", err);
      toast({
        variant: "destructive",
        title: "Error in rejecting call",
        description: err.response.data.message,
      });
      return rejectWithValue(err);
    }
  },
);

export const endCall = createAsyncThunk(
  "call/endCall",
  async ({ toast, navigate }, { rejectWithValue, getState }) => {
    try {
      const { call } = getState();
      await axiosInstance.post("/message/endCall", { id: call.callerID });
      if (typeof toast === "function") {
        toast({
          // variant: "success",
          title: "Call ended successfully",
        });
      }
      navigate("/");
      return;
    } catch (err) {
      console.log("error in endCall: ", err);
      return rejectWithValue(err);
    }
  },
);

export const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setOutgoingCall: (state, action) => {
      state.outgoingCall = action.payload;
    },
    setCallerData: (state, action) => {
      state.callerData = action.payload;
    },

    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    setIncomingOffer: (state, action) => {
      state.incomingOffer = action.payload;
    },
    setCallAccepted: (state, action) => {
      state.callAccepted = action.payload;
    },
    setCallRejected: (state, action) => {
      state.callRejected = action.payload;
    },
    setCallerID: (state, action) => {
      state.callerID = action.payload;
    },
    setAnswerOffer: (state, action) => {
      state.answerOffer = action.payload;
    },
    setIsCallOn: (state, action) => {
      state.isCallOn = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCall.fulfilled, (state, action) => {
        state.callerID = action.payload.receiverID;
        state.isCallOn = true;
        state.receiverSocketID = action.payload.receiverSocketID;
      })
      .addCase(generateCall.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(acceptCall.fulfilled, (state) => {
        state.callAccepted = true;
      })
      .addCase(acceptCall.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(rejectCall.fulfilled, (state) => {
        state.callerData = null;
        state.callerID = null;
        state.incomingOffer = null;
      })
      .addCase(rejectCall.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(endCall.fulfilled, (state) => {
        state.callerID = null;
        state.callerData = null;
        state.callAccepted = false;
        state.callRejected = false;
        state.callEnded = true;
        state.isCallOn = false;
        state.receiverSocketID = null;
      })
      .addCase(endCall.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setOutgoingCall,
  setCallerData,
  setIncomingCall,
  setIncomingOffer,
  setCallAccepted,
  setCallRejected,
  setCallerID,
  setAnswerOffer,
  setIsCallOn,
} = callSlice.actions;
export default callSlice.reducer;
