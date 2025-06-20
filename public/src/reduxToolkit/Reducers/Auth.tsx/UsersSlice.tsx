import { createSlice, createAsyncThunk,  PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
const base_URL2 = "http://localhost:13000/api/v1";
const base_URL = "http://localhost:8000/api/v1/auth";
export const getAllUsers = createAsyncThunk(
    "Users/GetAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found in localStorage");
            }
            // console.log(token, 'tokensss')

            const response = await fetch(`${base_URL}/users`, {
                method: "GET",
                headers: {
                    authorization: token
                },
            });

            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.message || response.statusText);
            }

            return resJson;
        } catch (error) {
            return rejectWithValue(error); // Return the entire error object
        }
    }
);

export const getUserChat = createAsyncThunk(
    "User/GetUserChat",
    async (id: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found in localStorage");
            }

            const response = await fetch(`${base_URL2}/message/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token
                },
            });

            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.message || response.statusText);
            }

            return resJson;
        } catch (error) {
            return rejectWithValue(error); // Return the entire error object
        }
    }
);

export const sendMessage = createAsyncThunk(
    "User/SendMessage",
    async ({ message, id }: { message: any; id: string }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found in localStorage");
            }

            const response = await fetch(`${base_URL2}/message/send/${id}`, {
                method: "POST",
                body: JSON.stringify({ message: message }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: token
                },
            });

            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.message || response.statusText);
            }
            // console.log(resJson, "response send message")
            return resJson;
        } catch (error: any) {
            return rejectWithValue(error.message); // Return the error message string
        }
    }
);



const initialState = {
    loading: false,
    result: null,
    error: null,
    singleChat: null
};

const usersReducers = createSlice({
    name: "UsersGetAll",
    initialState,
    reducers: {
        messageReceived: (state:any,action: PayloadAction<any>) => {
            console.log(action.payload, "actionssssssssss")
            // console.log(current(state), 'state')
            state.singleChat = state.singleChat ? [...state.singleChat, action.payload] : [action.payload];
            // console.log(current(state), 'state222')
        },
    },
    extraReducers: (builder) => {
        /** get all users for left side bar */
        builder.addCase(getAllUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.result = action.payload.data;
            state.error = null;
        });
        builder.addCase(getAllUsers.rejected, (state: any, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        /**  single user chat message for right side bar*/
        builder.addCase(getUserChat.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUserChat.fulfilled, (state, action) => {
            state.loading = false;
            state.singleChat = action.payload.message;
            state.error = null;
        });
        builder.addCase(getUserChat.rejected, (state: any, action: any) => {
            state.loading = false;
            state.error = action.error.message;
            toast.error(action.payload.message)

        });

        /** send message  */
        builder.addCase(sendMessage.fulfilled, (state: any, action) => {
            state.loading = false;
            const newMessage = action.payload.data;
            if (newMessage) {
                state.singleChat = state.singleChat ? [...state.singleChat, newMessage] : [newMessage];

            } else {
                builder.addCase(sendMessage.rejected, (state: any, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                    toast.error("Failed to send message: " + action.error.message);
                });
            }

            state.error = null;
        });
        // ---------------------------------------------------------------
    }
});

export const { messageReceived } = usersReducers.actions;

export default usersReducers.reducer;

