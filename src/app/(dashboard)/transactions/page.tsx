"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Payment, useGetAllPaymentsQuery } from "@/store/api/paymentApi";

const LIMIT = 10;

const TYPE_TABS = [
  { label: "All", value: undefined },
  { label: "Order", value: "order" },
  { label: "Donation", value: "donation" },
  { label: "Launch Fee", value: "launch_fee" },
  { label: "Brand Builder", value: "brand_builder" },
  { label: "Payout", value: "payout" },
] as const;

// Small debounce hook so we don't refetch on every keystroke
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TypeBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  const map: Record<string, string> = {
    order: "bg-blue-50 text-blue-600 border-blue-100",
    donation: "bg-rose-50 text-rose-600 border-rose-100",
    launch_fee: "bg-amber-50 text-amber-600 border-amber-100",
    brand_builder: "bg-indigo-50 text-indigo-600 border-indigo-100",
    payout: "bg-emerald-50 text-emerald-600 border-emerald-100",
    refund: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const classes =
    map[normalized] ?? "bg-slate-100 text-slate-500 border-slate-200";
  const label = type
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <span
      className={`rounded px-2 py-0.5 text-[12px] font-bold border ${classes}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "paid" || normalized === "success") {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-bold text-emerald-600 border border-emerald-100">
        {status}
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-600 border border-amber-100">
        Pending
      </span>
    );
  }
  if (normalized === "failed") {
    return (
      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[12px] font-bold text-rose-600 border border-rose-100">
        Failed
      </span>
    );
  }
  if (normalized === "disputed" || normalized === "refunded") {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-600 border border-amber-100 capitalize">
        {status}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-500 border border-slate-200 capitalize">
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 pr-4">
        <div className="h-3.5 w-20 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-5 w-16 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-3.5 w-28 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-3.5 w-14 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-3.5 w-12 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-3.5 w-14 rounded bg-slate-100" />
      </td>
      <td className="py-4 pr-4">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
      </td>
      <td className="py-4 flex justify-end">
        <div className="h-3.5 w-20 rounded bg-slate-100" />
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [selectedTypeTab, setSelectedTypeTab] =
    useState<(typeof TYPE_TABS)[number]["value"]>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  // useEffect(() => {
  //   setPage(1);
  // }, [debouncedSearch, selectedTypeTab]);

  const { data, isLoading, isFetching, isError } = useGetAllPaymentsQuery({
    page,
    limit: LIMIT,
    searchTerm: debouncedSearch,
    sortBy: "paidAt",
    sortOrder: "desc",
    paymentType: selectedTypeTab,
  });

  const payments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const isTableLoading = isLoading || isFetching;

  const summary = useMemo(() => {
    const grossVolume = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const platformFees = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const disputes = payments.filter((p) =>
      ["disputed", "failed"].includes(p.status.toLowerCase()),
    );
    const disputeAmount = disputes.reduce((sum, p) => sum + p.totalAmount, 0);
    return {
      grossVolume,
      platformFees,
      disputeCount: disputes?.length,
      disputeAmount,
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
        Transactions
      </h1>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Gross Volume */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">
              Gross Volume
            </span>
            <div className="text-2xl font-black text-slate-900">
              {isTableLoading ? (
                <div className="h-6 w-20 animate-pulse rounded bg-slate-100" />
              ) : (
                `$${summary.grossVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-[12px] text-slate-500 font-medium">
              This page&apos;s transactions
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <DollarSign className="size-5" />
          </div>
        </div>

        {/* Platform Fees */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">
              Platform Fees
            </span>
            <div className="text-2xl font-black text-slate-900">
              {isTableLoading ? (
                <div className="h-6 w-20 animate-pulse rounded bg-slate-100" />
              ) : (
                `$${summary.platformFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-[12px] text-slate-500 font-medium">
              Earned this page
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="size-5" />
          </div>
        </div>

        {/* Disputes */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">
              Failed
            </span>
            <div className="text-2xl font-black text-slate-900">
              {isTableLoading ? (
                <div className="h-6 w-8 animate-pulse rounded bg-slate-100" />
              ) : (
                summary.disputeCount
              )}
            </div>
            <p className="text-[12px] text-slate-500 font-medium">
              {isTableLoading
                ? "—"
                : `$${summary.disputeAmount.toFixed(2)} flagged`}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl w-fit">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSelectedTypeTab(tab.value)}
                className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                  selectedTypeTab === tab.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search TXN ID, organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-225 border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Transaction</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Organizer</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Fee</th>
                <th className="pb-3 pr-4">Net</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {isTableLoading &&
                Array.from({ length: LIMIT }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {isError && !isTableLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-rose-500 font-semibold"
                  >
                    Couldn&apos;t load transactions. Please try again.
                  </td>
                </tr>
              )}

              {!isTableLoading &&
                !isError &&
                payments.map((tx: Payment) => {
                  const stripeFee = Number(tx.stripeFee ?? 0);
                  const platformFee = Number(tx.platformFee ?? 0);
                  const fee = stripeFee + platformFee;
                  return (
                    <tr
                      key={tx._id}
                      className="transition-colors duration-200 hover:bg-slate-50/30"
                    >
                      {/* Transaction ID */}
                      <td className="py-4 pr-4 text-slate-500 font-bold">
                        <span title={tx.transactionId || "No transaction ID"}>
                          {tx.transactionId
                            ? tx.transactionId.length > 14
                              ? `${tx.transactionId.slice(0, 14)}…`
                              : tx.transactionId
                            : "N/A"}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 pr-4">
                        {tx.paymentType ? (
                          <TypeBadge type={tx.paymentType} />
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Organizer */}
                      <td className="py-4 pr-4 text-slate-500 font-medium">
                        {tx.organizerName || "N/A"}
                      </td>

                      {/* Amount */}
                      <td className="py-4 pr-4 text-slate-900 font-bold">
                        {typeof tx.totalAmount === "number"
                          ? `$${tx.totalAmount.toFixed(2)}`
                          : "N/A"}
                        {Boolean(tx.gstAmount && tx.gstAmount > 0) && (
                          <div className="text-[11px] font-medium text-slate-400">
                            +${tx.gstAmount?.toFixed(2)} tax
                          </div>
                        )}
                      </td>

                      {/* Fee */}
                      <td className="py-4 pr-4 text-slate-500 font-medium">
                        ${fee.toFixed(2)}
                      </td>

                      {/* Net (amount going to the organizer) */}
                      <td
                        className={`py-4 pr-4 font-black ${
                          typeof tx.organizerAmount === "number" &&
                          tx.organizerAmount < 0
                            ? "text-rose-600"
                            : "text-slate-900"
                        }`}
                      >
                        {typeof tx.organizerAmount === "number"
                          ? `$${tx.organizerAmount.toFixed(2)}`
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-4">
                        {tx.status ? (
                          <StatusBadge status={tx.status} />
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 text-right text-slate-400 font-medium">
                        {formatDate(tx.paidAt ?? tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}

              {!isTableLoading && !isError && payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      {/* Empty State Icon */}
                      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100">
                        <Search className="size-5 text-slate-400" />
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-700">
                        No transactions found
                      </h3>

                      {/* Description */}
                      <p className="mt-1 max-w-sm text-xs font-medium leading-relaxed text-slate-400">
                        There are no transactions available for the selected
                        {selectedTypeTab
                          ? ` ${selectedTypeTab.replace("_", " ")}`
                          : ""}
                        {searchTerm ? " matching your search." : " filters."}
                      </p>

                      {/* Search/filter hint */}
                      {(searchTerm || selectedTypeTab) && (
                        <p className="mt-2 text-[11px] font-semibold text-slate-400">
                          Try changing your search or selecting a different
                          transaction type.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-bold text-slate-400">
              Showing{" "}
              <span className="text-slate-700">
                {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="text-slate-700">{meta.total}</span>{" "}
              transactions
              {isFetching && !isTableLoading && (
                <span className="ml-2 text-slate-400">(updating...)</span>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isTableLoading}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<number[]>((acc, p) => {
                    if (acc?.length && p - acc[acc?.length - 1] > 1)
                      acc.push(-1);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === -1 ? (
                      <span key={`gap-${idx}`} className="px-1 text-slate-300">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`min-w-7 rounded-lg px-2 py-1.5 text-[12px] font-bold transition-colors duration-200 ${
                          p === page
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
