import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";



const initialState = {
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,
    error: null,
    selectedUserData: null,
    messageToSend: {
        text: "",
        audio: null
    },
    aiResponse: "",
    aiLoading: false,
    isCallOn: false,
    receiverSocketID: ""
};

export const getUsers = createAsyncThunk('message/users', async (_, { rejectWithValue }) => {

    try {
        const res = await axiosInstance.get('/message/users');

        return { users: res.data };
    } catch (err) {

        console.log("error in getUsers: ", err);
        return rejectWithValue(err);
    }
});


export const getMessages = createAsyncThunk('message/messages', async (data, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.get(`/message/${data.id}`);
        console.log("getMessages: runned for ", data.id);
        return { messages: res.data };
    } catch (err) {
        console.log("error in getMessages: ", err);
        return rejectWithValue(err);
    }
});

export const sendMessage = createAsyncThunk('message/send-message', async (data, { rejectWithValue, getState }) => {
    try {
        const state = getState().chat;
        const { selectedUser, messages } = state;
        if (!selectedUser) {
            throw new Error("No user selected");
        }
        const res = await axiosInstance.post(`/message/send-message/${selectedUser}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return { messages: [...messages, res.data] };
    } catch (err) {
        console.log("error in sendMessage: ", err);
        return rejectWithValue(err);
    }
});

export const getAiResponse = createAsyncThunk('message/getAiResponse', async (data, { rejectWithValue }) => {
    try {
        if (!data.userInput) {
            throw new Error("User input is required");
        }
        const res = await axiosInstance.post(`/message/getAiResponse`, data);
        return { aiResponse: res.data };
    } catch (err) {
        console.log("error in getAiResponse: ", err);
        //toast("Error in AI response");
        return rejectWithValue(err);
    }
});

export const deleteMessage = createAsyncThunk('message/delete-message', async ({ data, toast }, { rejectWithValue, getState }) => {

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
            data: { id: data.id }
        });
        toast({
            description: "Your message has been deleted.",
        });
        return { messages: messages.filter(message => message.id !== data.id) };
    } catch (err) {
        toast({
            variant: "destructive",
            title: "Error in deleting message",
            description: err.response.data.message,
        });
        console.log("error in deleteMessage: ", err);
        return rejectWithValue(err);
    }
});

// Socket listener for message updates


export const subscribeToMessages = () => (dispatch, getState) => {
    const { chat, auth } = getState();
    if (!chat.selectedUser || !auth.socket) {
        return;
    }


    auth.socket.on('message', (data) => {
        if (data.senderID !== chat.selectedUser) return;
        const currentMessages = getState().chat.messages;
        dispatch(setMessages([...currentMessages, data]));
        console.log("Subscribed to messages", chat.selectedUser);
    });
    auth.socket.on('messageDeleted', (data) => {
        const currentMessages = getState().chat.messages;
        dispatch(setMessages(currentMessages.filter(message => message.id !== data.id)));
    });
};

export const unsubscribeToMessages = () => (dispatch, getState) => {
    const { auth } = getState();
    if (auth.socket) {
        auth.socket.off('message');
        console.log("Unsubscribed to messages", getState().chat.selectedUser);
    }

};

export const generateCall = createAsyncThunk('message/generateCall', async ({ toast, offer }, { rejectWithValue, getState }) => {
    try {
        //fix onlineuser calling only
        const { chat, auth } = getState();
        if (!auth.onlineUsers.includes(chat.selectedUser)) {
            throw new toast({
                variant: "destructive",
                description: "Calling is only available to Online Users",
            });
        }
        const res = await axiosInstance.post('/message/generateCall', {
            id: chat.selectedUser,
            offer: offer
        });
        console.log("callUser: ", res.data);
        return { receiverSocketID: res.data.receiverSocketID };
    } catch (err) {
        console.log("error in call: ", err);
        toast({
            variant: "destructive",
            title: "Calling is only available to Online Users",
            description: err.response.data.message,
        });
        return rejectWithValue(err);
    }
});

export const acceptCall = createAsyncThunk('message/acceptCall', async ({ toast, answer }, { rejectWithValue, getState }) => {
    try {
        const { chat } = getState();
        const res = await axiosInstance.post('/message/acceptCall', {
            id: chat.selectedUser,
            answer: answer
        });
        console.log("acceptCall: ", res.data);
        return { receiverSocketID: res.data.receiverSocketID };
    } catch (err) {
        console.log("error in acceptCall: ", err);
        toast({
            variant: "destructive",
            title: "Error in accepting call",
            description: err.response.data.message,
        });
        return rejectWithValue(err);
    }
});
export const endCall = createAsyncThunk('message/endCall', async (_, { rejectWithValue, getState }) => {
    try {
        const chat = getState().chat;
        await axiosInstance.post('/message/endCall', { id: chat.selectedUser });
        return;
    } catch (err) {
        console.log("error in endCall: ", err);
        return rejectWithValue(err);
    }
});

export const chatSlice = createSlice({
    name: 'chat',
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
        setIsCallOn: (state, action) => {
            state.isCallOn = action.payload;
        }
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
            }
            )
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
            .addCase(generateCall.fulfilled, (state, action) => {
                state.receiverSocketID = action.payload.receiverSocketID;
                state.isCallOn = true;
            })
            .addCase(generateCall.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(endCall.fulfilled, (state) => {
                state.receiverSocketID = null;
                state.isCallOn = false;
            })
            .addCase(endCall.rejected, (state, action) => {
                state.error = action.payload;
            });

    },
});

export const { setSelectedUser, setSelectedUserData, setMessageToSend, setMessages, setIsCallOn } = chatSlice.actions;
export default chatSlice.reducer;