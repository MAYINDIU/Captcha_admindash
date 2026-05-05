import { apiSlice } from "./apiSlice";

const attendance = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceinfo: builder.query({
      query: (EMP_ID) => ({
        url: `/attendanceInfo.php?EMP_ID=${EMP_ID}`,
      }),
      providesTags: ["attendance"],
    }),
  }),
  overrideExisting: true, // Ensure this option is set to true to override existing endpoint
});

export const {
  useGetAttendanceinfoQuery,
} = attendance;
