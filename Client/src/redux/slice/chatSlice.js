import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { encryptMessage, decryptMessage } from "@/lib/crypto";


const initialState = {
  messages: [],
  users: [],
  isKeysLoading: false,
  publicKeys: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,
  error: null,
  selectedUserData: null,
  messageToSend: {
    text: "",
    audio: null,
  },
  aiResponse: "",
  aiLoading: false,
};

export const getUsers = createAsyncThunk(
  "message/users",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/message/users");

      return { users: res.data };
    } catch (err) {
      console.log("error in getUsers: ", err);
      return rejectWithValue(err?.response?.data || err.message);
    }
  },
);

export const getMessages = createAsyncThunk(
  "message/messages",
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const targetUserId = data?.id || state.chat.selectedUser;

      const senderDevicesIds = state.chat.publicKeys.map((key) => key.id);
      const myDeviceId = state.auth.deviceID;
      const myPrivateKey = state.auth.private_key;

      const res = await axiosInstance.get(
        `/message/received-messages/${targetUserId}`,
        {
          params: {
            myDeviceId: myDeviceId,
            senderDevicesIds: senderDevicesIds,
          },
        },
      );

      let messages = [];
      const seenSentMessages = new Set();
      for (const message of res.data) {
        let i_am_sender = message.senderDeviceId === myDeviceId;

        // Find the other person's public key
        const theirPublicKey = state.chat.publicKeys.find(
          (key) =>
            key.id ===
            (i_am_sender ? message.receiverDeviceId : message.senderDeviceId),
        )?.publicKey;

        let decrypted;
        try {
          if (!theirPublicKey) throw new Error("Public key not found");
          decrypted = decryptMessage(
            message.ciphertext,
            message.nonce,
            theirPublicKey,
            myPrivateKey,
          );
        } catch (err) {
          console.warn("Failed to decrypt a message:", err.message);
          decrypted = "This message could not be decrypted.";
        }

        // Deduplicate outgoing messages sent to multiple devices
        if (i_am_sender) {
          const uniqueKey = `${message.createdAt}-${decrypted}`;
          if (seenSentMessages.has(uniqueKey)) continue;
          seenSentMessages.add(uniqueKey);
        }

        messages.push({
          id: message.id,
          text: decrypted,
          senderDeviceId: message.senderDeviceId,
          receiverDeviceId: message.receiverDeviceId,
          senderID: i_am_sender ? state.auth.authUser.id : targetUserId, // Needed for ChatAreaDemo UI
          createdAt: message.createdAt,
        });
      }
      return { messages: messages };
    } catch (err) {
      console.log("error in getMessages: ", err);
      return rejectWithValue(err?.response?.data || err.message);
    }
  },
);

export const getPublicKeys = createAsyncThunk(
  "auth/getPublicKeys",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/auth/get-public-keys/${userId}`);
      return res.data.devices; // Assuming the server returns { devices: [...] }
    } catch (err) {
      console.error("Error in getPublicKeys:", err);
      return rejectWithValue({
        message: "Failed to retrieve public keys",
        error: err?.response?.data || err.message,
      });
    }
  },
);

export const sendMessage = createAsyncThunk(
  "message/send-message",
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState().chat;
      const authState = getState().auth;
      const { selectedUser, messages } = state;
      if (!selectedUser) {
        throw new Error("No user selected");
      } //per device encryption can be implemented here using the public keys retrieved for the selected user and then we need to send the encrypted message along with the nounce and the id of the public key used for encryption so that the server can forward it to the receiver and the receiver can decrypt it using the corresponding private key

      const arr = [];
      for (const device of state.publicKeys) {
        const { ciphertext, nonce } = encryptMessage(
          data.text,
          device.publicKey,
          authState.private_key,
        );

        arr.push({
          senderDevice: authState.deviceID,
          receiverDevice: device.id,
          ciphertext,
          nonce,
        });
      }
      console.log("Sending encrypted messages: ", arr);
      const res = await axiosInstance.post(
        `/message/send-message/${selectedUser}`,
        arr,
      );
      return {
        messages: [
          ...messages,
          {
            id: res.data.id || Date.now().toString(),
            text: data.text,
            senderDeviceId: authState.deviceID,
            receiverDeviceId: state.publicKeys[0]?.id || "", // placeholder for optimistic UI
            senderID: authState.authUser.id,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    } catch (err) {
      console.log("error in sendMessage: ", err);
      return rejectWithValue(err?.response?.data || err.message);
    }
  },
);

export const getAiResponse = createAsyncThunk(
  "message/getAiResponse",
  async (data, { rejectWithValue }) => {
    try {
      if (!data.userInput) {
        throw new Error("User input is required");
      }
      const res = await axiosInstance.post(`/message/getAiResponse`, data);
      return { aiResponse: res.data };
    } catch (err) {
      console.log("error in getAiResponse: ", err);
      //toast("Error in AI response");
      return rejectWithValue(err?.response?.data || err.message);
    }
  },
);

export const deleteMessage = createAsyncThunk(
  "message/delete-message",
  async ({ data, toast }, { rejectWithValue, getState }) => {
    try {
      const state = getState().chat;
      const { authUser } = getState().auth;
      const { selectedUser, messages } = state;
      if (!selectedUser) {
        throw new Error("No user selected");
      }
      if (data.senderID !== authUser.id) {
        throw new Error("You are not authorized to delete this message");
      }
      await axiosInstance.delete(`/message/delete-message`, {
        data: { id: data.id },
      });
      toast({
        description: "Your message has been deleted.",
      });
      return { messages: messages.filter((message) => message.id !== data.id) };
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error in deleting message",
        description: err.response.data.message,
      });
      console.log("error in deleteMessage: ", err);
      return rejectWithValue(err);
    }
  },
);

// Socket listener for message updates

export const subscribeToMessages = () => (dispatch, getState) => {
  const { chat, auth } = getState();
  if (!chat.selectedUser || !auth.socket) {
    return;
  }

  auth.socket.on("message", (payload) => {
    const { senderID, encryptedMessages } = payload;
    if (senderID !== chat.selectedUser) return;

    const myEncryptedMessage = encryptedMessages.find(m => m.receiverDevice === auth.deviceID);
    if (!myEncryptedMessage) return;

    const theirPublicKeyObj = chat.publicKeys.find(key => key.id === myEncryptedMessage.senderDevice);
    if (!theirPublicKeyObj) return;

    try {
      const decrypted = decryptMessage(
        myEncryptedMessage.ciphertext,
        myEncryptedMessage.nonce,
        theirPublicKeyObj.publicKey,
        auth.private_key
      );

      const newMessage = {
        id: Date.now().toString(),
        text: decrypted,
        senderDeviceId: myEncryptedMessage.senderDevice,
        receiverDeviceId: myEncryptedMessage.receiverDevice,
        senderID: senderID,
        createdAt: new Date().toISOString(),
      };

      const currentMessages = getState().chat.messages;
      dispatch(setMessages([...currentMessages, newMessage]));
      console.log("Received new message from", chat.selectedUser);
    } catch (err) {
      console.warn("Failed to decrypt incoming socket message:", err.message);
    }
  });
  auth.socket.on("messageDeleted", (data) => {
    const currentMessages = getState().chat.messages;
    dispatch(
      setMessages(currentMessages.filter((message) => message.id !== data.id)),
    );
  });
};

export const unsubscribeToMessages = () => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.socket) {
    auth.socket.off("message");
    console.log("Unsubscribed to messages", getState().chat.selectedUser);
  }
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedUserData: (state, action) => {
      state.selectedUserData = action.payload;
    },
    setMessageToSend: (state, action) => {
      state.messageToSend = { ...state.messageToSend, ...action.payload };
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUserLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.isUserLoading = false;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.payload;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessageLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
        state.isMessageLoading = false;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isMessageLoading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getAiResponse.pending, (state) => {
        state.aiLoading = true;
      })
      .addCase(getAiResponse.fulfilled, (state, action) => {
        state.aiResponse = action.payload.aiResponse.message;
        state.aiLoading = false;
      })
      .addCase(getAiResponse.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getPublicKeys.pending, (state) => {
        state.isKeysLoading = true;
      })
      .addCase(getPublicKeys.fulfilled, (state, action) => {
        state.publicKeys = action.payload;
        state.isKeysLoading = false;
      })
      .addCase(getPublicKeys.rejected, (state, action) => {
        state.isKeysLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedUser,
  setSelectedUserData,
  setMessageToSend,
  setMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
