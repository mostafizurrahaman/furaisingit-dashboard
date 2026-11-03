import { baseApi } from "./baseApi";

export type PaymentType =
  | "order"
  | "donation"
  | "launch_fee"
  | "brand_builder"
  | "payout"
  | "refund"
  | string;

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "disputed" | string;

export type Payment = {
  _id: string;
  paymentId: string;
  transactionId: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string | null;
  organizerProfileImage: string | null;
  campaignId?: string;
  brandBuilderId?: string | null;
  orderId?: string | null;
  donationId?: string | null;
  payoutId?: string | null;
  paymentType: PaymentType;
  paymentBreakdownId?: string;
  subtotal: number;
  shippingFee: number;
  gstAmount?: number;
  totalAmount: number;
  stripeFee: number;
  platformFee: number;
  organizerAmount: number;
  organizerAmountWithoutShipping: number;
  organizerRaisedAmount?: number;
  discountAmount: number;
  stripeTaxTransactionId?: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetAllPaymentsResponse = {
  success: boolean;
  message: string;
  meta: PaymentMeta;
  data: Payment[];
};

export type GetAllPaymentsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  fromDate?: string;
  toDate?: string;
  skipPagination?: boolean;
  campaignId?: string;
  organizerId?: string;
  paymentType?: string;
  paymentStatus?: string;
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayments: builder.query<GetAllPaymentsResponse, GetAllPaymentsParams>({
      query: ({
        page = 1,
        limit = 10,
        searchTerm,
        sortBy = "paidAt",
        sortOrder,
        fromDate,
        toDate,
        skipPagination,
        campaignId,
        organizerId,
        paymentType,
        paymentStatus,
      }) => {
        // Backend Zod validation rejects empty strings for these fields,
        // so we only attach params that actually have a value.
        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };

        if (searchTerm?.trim()) params.searchTerm = searchTerm.trim();
        if (sortBy?.trim()) params.sortBy = sortBy.trim();
        if (sortOrder?.toString().trim()) params.sortOrder = sortOrder.toString().trim();
        if (fromDate?.trim()) params.fromDate = fromDate.trim();
        if (toDate?.trim()) params.toDate = toDate.trim();
        if (skipPagination) params.skipPagination = skipPagination;
        if (campaignId?.trim()) params.campaignId = campaignId.trim();
        if (organizerId?.trim()) params.organizerId = organizerId.trim();
        if (paymentType?.trim()) params.paymentType = paymentType.trim();
        if (paymentStatus?.trim()) params.paymentStatus = paymentStatus.trim();

        return {
          url: "/payment/all",
          params,
        };
      },
    }),
  }),
});

export const { useGetAllPaymentsQuery } = paymentApi;