import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://app2.primeislamilifeinsurance.com/Attendance/",
  }),
  tagTypes: ["attendance"],
  tagTypes: ["attendance"],
  endpoints: (builder) => ({}),
});