import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listings: [],
  userListings: [],
  balance: {
    earned: 0,
    withdrawn: 0,
    available: 0,
  },
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    serListings: (state, action) => {
      state.listings = action.payload;
    },
  },
});

export const { serListings } = listingSlice.actions;

export default listingSlice.reducer;