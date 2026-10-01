"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useGetWaitlistsQuery, WaitlistEntry } from "@/store/api/waitlistApi";
import { useToast } from "@/components/ToastProvider";

const PAGE_SIZE = 10;

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WaitlistsPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vipFilter, setVipFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Parse isVip boolean for query
  const isVipParam = useMemo(() => {
    if (vipFilter === "true") return true;
    if (vipFilter === "false") return false;
    return undefined;
  }, [vipFilter]);

  const { data, isLoading, isFetching, isError, refetch } = useGetWaitlistsQuery({
    page,
    limit: PAGE_SIZE,
    searchTerm: searchTerm.trim() || undefined,
    status: statusFilter || undefined,
    isVip: isVipParam,
    sortBy,
    sortOrder,
  });

  const waitlists = data?.data ?? [];
  const meta = data?.meta;

  const totalCount = meta?.total ?? 0;
  const totalVipCount = meta?.totalVip ?? 0;
  const totalStandardCount = meta?.totalStandard ?? 0;

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setVipFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const buildExportUrl = (endpoint: string) => {
    const queryParams = new URLSearchParams();
    if (searchTerm.trim()) queryParams.set("searchTerm", searchTerm.trim());
    if (statusFilter) queryParams.set("status", statusFilter);
    if (vipFilter !== "") queryParams.set("isVip", vipFilter);
    if (sortBy) queryParams.set("sortBy", sortBy);
    if (sortOrder) queryParams.set("sortOrder", sortOrder);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    return `${baseUrl}/waitlist/${endpoint}?${queryParams.toString()}`;
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
          : null;

      const exportUrl = buildExportUrl("export-excel");
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export Excel: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const disposition = response.headers.get("Content-Disposition");
      let filename = `waitlist_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches?.[1]) {
          filename = matches[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toastSuccess(
        "Excel Export Successful",
        `Waitlist Excel spreadsheet "${filename}" downloaded.`
      );
    } catch (err: unknown) {
      console.error("Excel export error:", err);
      toastError(
        "Excel Export Failed",
        err instanceof Error ? err.message : "Unable to export waitlist Excel."
      );
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
          : null;

      const exportUrl = buildExportUrl("export-csv");
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export CSV: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const disposition = response.headers.get("Content-Disposition");
      let filename = `waitlist_export_${new Date().toISOString().slice(0, 10)}.csv`;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches?.[1]) {
          filename = matches[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toastSuccess(
        "CSV Export Successful",
        `Waitlist CSV file "${filename}" downloaded.`
      );
    } catch (err: unknown) {
      console.error("CSV export error:", err);
      toastError(
        "CSV Export Failed",
        err instanceof Error ? err.message : "Unable to export waitlist CSV."
      );
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Waitlists
            </h1>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
              {meta ? `${meta.total} Members` : "Loading..."}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            View, filter, and manage registered and VIP early access waitlist members.
          </p>
        </div>

        {/* Top Action: Refresh, Export Excel, Export CSV */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Excel (.xlsx) */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel || isLoading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            title="Download Waitlist Excel (.xlsx) Spreadsheet"
          >
            {isExportingExcel ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Exporting Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="size-4" />
                <span>Export Excel</span>
              </>
            )}
          </button>

          {/* Export CSV (.csv) */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv || isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            title="Download Waitlist CSV Spreadsheet"
          >
            {isExportingCsv ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Exporting CSV...</span>
              </>
            ) : (
              <>
                <Download className="size-4 text-slate-500" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Members */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Waitlist
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {totalCount.toLocaleString()}
            </span>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Registered emails on waitlist
            </p>
          </div>
        </div>

        {/* VIP Members */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              VIP Members
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Crown className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-900">
              {totalVipCount.toLocaleString()}
            </span>
            <p className="mt-1 text-xs font-medium text-amber-700/80">
              Claimed phone & early perks
            </p>
          </div>
        </div>

        {/* Standard Members */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Standard Members
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {totalStandardCount.toLocaleString()}
            </span>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Standard email registration
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, phone, or member # (e.g. #1)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* VIP Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="size-3.5 text-slate-400" />
              <span>Tier:</span>
              <select
                value={vipFilter}
                onChange={(e) => {
                  setVipFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="">All Tiers</option>
                <option value="true">VIP Only</option>
                <option value="false">Standard Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Filter className="size-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="vip">VIP</option>
                <option value="registered">Registered</option>
                <option value="skipped_vip">Skipped VIP</option>
              </select>
            </div>

            {/* Active filters reset */}
            {(searchTerm || statusFilter || vipFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waitlist Data Table Container */}
      {isLoading ? (
        <WaitlistTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="size-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Failed to load waitlist entries
          </h2>
          <p className="max-w-md text-sm text-slate-500">
            Could not fetch waitlist data from the server. Please check your network or try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          {/* Desktop / Tablet Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th
                    className="px-6 py-3.5 cursor-pointer transition hover:text-slate-800"
                    onClick={() => handleSortToggle("memberNumber")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Member #</span>
                      <ArrowUpDown className="size-3" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer transition hover:text-slate-800"
                    onClick={() => handleSortToggle("email")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      <ArrowUpDown className="size-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Tier</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">VIP Claimed At</th>
                  <th
                    className="px-6 py-3.5 text-right cursor-pointer transition hover:text-slate-800"
                    onClick={() => handleSortToggle("createdAt")}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Joined Date</span>
                      <ArrowUpDown className="size-3" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {waitlists.map((entry) => (
                  <WaitlistTableRow key={entry._id} entry={entry} />
                ))}

                {!waitlists.length && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Users className="size-6" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        No waitlist members found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try modifying your search or filter settings.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="divide-y divide-slate-100 md:hidden">
            {waitlists.map((entry) => (
              <WaitlistMobileCard key={entry._id} entry={entry} />
            ))}

            {!waitlists.length && (
              <div className="py-12 text-center text-sm font-semibold text-slate-400">
                No waitlist members found.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <span className="text-xs font-semibold text-slate-500">
                Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-bold text-slate-800">{meta.totalPages}</span> •{" "}
                <span className="font-bold text-slate-800">{meta.total}</span> matching members
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= meta.totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WaitlistTableRow({ entry }: { entry: WaitlistEntry }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-slate-50/50">
      {/* Member # */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
          {entry.formattedMemberNumber || `#${entry.memberNumber}`}
        </span>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Mail className="size-4 shrink-0 text-slate-400" />
          <span className="font-bold">{entry.email}</span>
        </div>
      </td>

      {/* Phone Number */}
      <td className="px-6 py-4">
        {entry.phoneNumber ? (
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="size-3.5 shrink-0 text-slate-400" />
            <span className="font-mono text-xs font-semibold">{entry.phoneNumber}</span>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400">N/A</span>
        )}
      </td>

      {/* Tier */}
      <td className="px-6 py-4">
        {entry.isVip ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/70 shadow-2xs">
            <Crown className="size-3 fill-amber-500 text-amber-500" />
            VIP Access
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Standard
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={entry.status} />
      </td>

      {/* VIP Claimed At */}
      <td className="px-6 py-4 text-xs font-medium text-slate-500">
        {formatDateTime(entry.vipClaimedAt)}
      </td>

      {/* Joined Date */}
      <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">
        {formatDateTime(entry.createdAt)}
      </td>
    </tr>
  );
}

function WaitlistMobileCard({ entry }: { entry: WaitlistEntry }) {
  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
          {entry.formattedMemberNumber || `#${entry.memberNumber}`}
        </span>
        <StatusBadge status={entry.status} />
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Mail className="size-4 shrink-0 text-slate-400" />
        <span className="truncate">{entry.email}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          {entry.isVip ? (
            <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
              <Crown className="size-3 fill-amber-500 text-amber-500" />
              VIP Member
            </span>
          ) : (
            <span className="text-slate-500 font-semibold">Standard</span>
          )}
          {entry.phoneNumber && (
            <span className="font-mono text-slate-600">• {entry.phoneNumber}</span>
          )}
        </div>

        <span>{formatDateTime(entry.createdAt)}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "vip":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="size-3" />
          VIP Active
        </span>
      );
    case "skipped_vip":
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          Skipped VIP
        </span>
      );
    case "registered":
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          Registered
        </span>
      );
  }
}

function WaitlistTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 items-center gap-4 px-6 py-4">
            <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
