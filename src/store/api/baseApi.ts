import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,

  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ??
        sessionStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});

const baseQueryWithAuthHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");

      // Clear RTK Query cache
      api.dispatch(baseApi.util.resetApiState());

      // Go directly to login
      window.location.replace("/login");
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithAuthHandling,

  tagTypes: [
    "PromoCode",
    "Review",
    "Auth",
    "User",
    "Content",
    "Admin",
    "Newsletter",
    "Support",
    "Brand",
    "Campaign",
    "Waitlist",
  ],

  endpoints: () => ({}),
});