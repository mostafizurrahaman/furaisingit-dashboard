"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  FileText,
  Flag,
  Headphones,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Palette,
  Settings,
  UsersRound,
  ClipboardCheck,
  WalletCards,
  Tag,
  X,
  ListOrdered,
} from "lucide-react";

import logo from "../images/logo.png";
import { useDispatch } from "react-redux";
import { baseApi } from "@/store/api/baseApi";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type LogoutConfirmModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
};

const navigationItems = [
  { href: "/home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Flag },
  { href: "/organizers", label: "Organizers", icon: UsersRound },
  { href: "/transactions", label: "Transactions", icon: WalletCards },
  { href: "/promo-codes", label: "Promo Codes", icon: Tag },
  { href: "/brandBuilder", label: "Brand Builder", icon: Palette },
  { href: "/review", label: "Review", icon: ClipboardCheck },

  {
    href: "/support",
    label: "Support",
    icon: Headphones,
    supportOnly: true,
  },

  { href: "/newsletter", label: "Newsletter", icon: Mail },
  { href: "/waitlists", label: "Waitlists", icon: ListOrdered },
  { href: "/admin", label: "Admin", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

const contentItems = [
  {
    href: "/content/acceptable_use_policy",
    label: "Acceptable Use Policy",
  },
  {
    href: "/content/refund_policy",
    label: "Refund Policy",
  },
  {
    href: "/content/seller_agreement",
    label: "Seller Agreement",
  },
  {
    href: "/content/website_disclaimer",
    label: "Website Disclaimer",
  },
  {
    href: "/content/cookie_policy",
    label: "Cookie Policy",
  },
  {
    href: "/content/privacy_policy",
    label: "Privacy Policy",
  },
  {
    href: "/content/buyer_terms_and_condition",
    label: "Buyer Terms & Conditions",
  },
  {
    href: "/content/charge_back_and_dispute_resolution_policy",
    label: "Chargeback & Dispute Resolution",
  },
  {
    href: "/content/terms_and_conditions",
    label: "Terms & Conditions",
  },
];

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isContentActive = pathname.startsWith("/content");
  const [isContentOpen, setIsContentOpen] = useState(isContentActive);

  const [role] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("role") || sessionStorage.getItem("role");
  });

  const isSupportAdmin = role === "support_admin";

  const handleContentToggle = () => {
    setIsContentOpen((prev) => !prev);
  };

const handleConfirmLogout = () => {
  setIsLoggingOut(true);

  localStorage.removeItem("token");
  localStorage.removeItem("role");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");

  // Clear all RTK Query cached data
  dispatch(baseApi.util.resetApiState());

  setTimeout(() => {
    setShowLogoutModal(false);
    onClose?.();
    router.replace("/login");
  }, 600);
};

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col bg-[#041533] text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/home"
            className="transition-opacity duration-200 hover:opacity-80"
            onClick={onClose}
          >
            <Image
              src={logo}
              alt="FunRaisingIt"
              className="h-auto w-32"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
          aria-label="Dashboard navigation"
        >
          {navigationItems
            .filter((item) =>
              isSupportAdmin ? item.supportOnly === true : !item.supportOnly,
            )
            .map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}

          {!isSupportAdmin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleContentToggle}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isContentActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                aria-expanded={isContentOpen}
                aria-controls="content-navigation"
              >
                <span className="flex items-center gap-3">
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  Content
                </span>

                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    isContentOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                id="content-navigation"
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isContentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {contentItems.map(({ href, label }) => {
                      const isActive = pathname === href;

                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={onClose}
                          className={`block rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                Log out
              </>
            )}
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleConfirmLogout}
          isLoggingOut={isLoggingOut}
        />
      )}
    </>
  );
};

function LogoutConfirmModal({
  onCancel,
  onConfirm,
  isLoggingOut,
}: LogoutConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <LogOut className="size-5" />
        </div>

        <h2
          id="logout-modal-title"
          className="mt-4 text-center text-base font-bold text-slate-900"
        >
          Log out of your account?
        </h2>

        <p className="mt-1.5 text-center text-sm text-slate-500">
          You&apos;ll need to sign in again to access the dashboard.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
