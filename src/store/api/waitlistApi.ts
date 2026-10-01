import { baseApi } from "./baseApi";

export type WaitlistStatus = "registered" | "vip" | "skipped_vip";

export interface WaitlistEntry {
  _id: string;
  email: string;
  phoneNumber?: string | null;
  status: WaitlistStatus;
  memberNumber: number;
  formattedMemberNumber: string;
  isVip: boolean;
  vipClaimedAt?: string | null;
  vipSkippedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalVip: number;
  totalStandard: number;
  filteredVip?: number;
  filteredStandard?: number;
}

export interface GetWaitlistsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: WaitlistMeta;
  data: WaitlistEntry[];
}

export interface GetWaitlistsQueryArgs {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  isVip?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  skipPagination?: boolean;
}

export const waitlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWaitlists: builder.query<GetWaitlistsResponse, GetWaitlistsQueryArgs | void>({
      query: (args) => {
        const {
          page = 1,
          limit = 10,
          searchTerm,
          status,
          isVip,
          fromDate,
          toDate,
          sortBy = "createdAt",
          sortOrder = "desc",
          skipPagination,
        } = args || {};

        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };

        if (searchTerm?.trim()) params.searchTerm = searchTerm.trim();
        if (status?.trim()) params.status = status.trim();
        if (isVip !== undefined) params.isVip = isVip;
        if (fromDate?.trim()) params.fromDate = fromDate.trim();
        if (toDate?.trim()) params.toDate = toDate.trim();
        if (sortBy?.trim()) params.sortBy = sortBy.trim();
        if (sortOrder?.trim()) params.sortOrder = sortOrder.trim();
        if (skipPagination !== undefined) params.skipPagination = skipPagination;

        return {
          url: "/waitlist/all",
          params,
        };
      },
      providesTags: ["Waitlist"],
    }),
  }),
});

export const { useGetWaitlistsQuery } = waitlistApi;
