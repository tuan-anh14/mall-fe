import type { ReactNode } from "react";
import { cn } from "../ui/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export function AdminPageLayout({
  title,
  description,
  kicker = "Quản trị",
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  kicker?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "container mx-auto max-w-7xl space-y-6 px-4 py-8 lg:py-10",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {kicker}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function AdminSpinner({
  className,
  label = "Đang tải…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[12rem] flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      {label ? <p className="text-sm text-gray-500">{label}</p> : null}
    </div>
  );
}

/** Khối bảng / danh sách chính */
export const adminPanelClass =
  "rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden";

/** Form nổi (thêm/sửa) */
export const adminFormPanelClass =
  "rounded-2xl border border-blue-100/90 bg-white p-5 shadow-sm ring-1 ring-primary/10";

/** Hàng thead */
export const adminTheadRowClass = "border-b border-gray-200/90 bg-gray-50/90";

/** Ô tiêu đề cột */
export const adminThClass =
  "px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:px-6";

/** Hàng tbody */
export const adminTrClass =
  "border-b border-gray-100 transition-colors hover:bg-gray-50/80";

/** Nút primary admin (đồng bộ theme) */
export const adminBtnPrimaryClass =
  "rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90";

/** Vùng phân trang */
export const adminPaginationBarClass =
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm";

export function AdminPagination({
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  totalItems?: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={adminPaginationBarClass}>
      {totalItems !== undefined ? (
        <p className="text-sm text-gray-500">
          Trang {currentPage} / {totalPages} ({totalItems.toLocaleString("vi-VN")} bản ghi)
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Trang {currentPage} / {totalPages}
        </p>
      )}

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="h-8 w-8 p-0 border-gray-200 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
          .reduce<(number | string)[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1 flex items-end pb-1">…</span>
            ) : (
              <Button
                key={item}
                variant={currentPage === item ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(item as number)}
                className={`h-8 w-8 p-0 text-xs font-medium transition-all duration-200 ${
                  currentPage === item
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item}
              </Button>
            )
          )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="h-8 w-8 p-0 border-gray-200 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
