import type { ReactNode } from "react";
import { cn } from "../ui/utils";

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
