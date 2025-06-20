// chatSlice.js

import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  singleChat: any[]; // Consider defining a more specific type for your chat messages
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  singleChat: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    messageReceived: (state, action: PayloadAction<any>) => { // Consider using a more specific type instead of any
      // Add the received message to the singleChat array
      console.log(action.payload,"action")
      console.log(current(state),'state')
      state.singleChat.push(action.payload);
    },
   
    // You might want to add other reducers for handling loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { messageReceived, setLoading, setError } = chatSlice.actions;

export default chatSlice.reducer;
