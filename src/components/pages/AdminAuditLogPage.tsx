import { useEffect, useState, useCallback } from "react";
import { History, ChevronLeft, ChevronRight, Shield, Filter, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get } from "../../lib/api";
import { toast } from "sonner";
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  adminTheadRowClass,
  adminThClass,
  adminTrClass,
  adminPaginationBarClass,
} from "../admin/AdminPageLayout";

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  createdAt: string;
  admin: { id: string; firstName: string; lastName: string; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  UPDATE: "border border-blue-200 bg-blue-50 text-blue-800",
  DELETE: "border border-red-200 bg-red-50 text-red-800",
  APPROVE: "border border-emerald-200 bg-emerald-50 text-emerald-900",
  REJECT: "border border-amber-200 bg-amber-50 text-amber-900",
  BAN: "border border-amber-200 bg-amber-50 text-amber-950",
  ADJUST_WALLET: "border border-indigo-200 bg-indigo-50 text-indigo-800",
};

const RESOURCE_LABELS: Record<string, string> = {
  category: "Danh mục",
  coupon: "Mã giảm giá",
  account: "Tài khoản",
  review: "Đánh giá",
  seller_request: "Yêu cầu seller",
  wallet: "Ví người dùng",
};

const ACTION_OPTIONS = [
  { value: "ALL", label: "Tất cả hành động" },
  { value: "CREATE", label: "Tạo mới" },
  { value: "UPDATE", label: "Cập nhật" },
  { value: "DELETE", label: "Xóa" },
  { value: "APPROVE", label: "Phê duyệt" },
  { value: "REJECT", label: "Từ chối" },
  { value: "BAN", label: "Khóa tài khoản" },
  { value: "ADJUST_WALLET", label: "Nạp/trừ ví" },
];

const RESOURCE_OPTIONS = [
  { value: "ALL", label: "Tất cả đối tượng" },
  { value: "account", label: "Tài khoản" },
  { value: "category", label: "Danh mục" },
  { value: "coupon", label: "Mã giảm giá" },
  { value: "review", label: "Đánh giá" },
  { value: "seller_request", label: "Yêu cầu seller" },
  { value: "wallet", label: "Ví người dùng" },
];

export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 50;

  const openLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (resourceFilter !== "ALL") params.set("resource", resourceFilter);
      const data = await get<{ logs: AuditLog[]; total: number }>(`/api/v1/admin/audit-logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải lịch sử thao tác");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, resourceFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (type: "action" | "resource", value: string) => {
    setPage(1);
    if (type === "action") setActionFilter(value);
    else setResourceFilter(value);
  };

  const hasFilter = actionFilter !== "ALL" || resourceFilter !== "ALL";
  const totalPages = Math.ceil(total / limit);

  return (
    <AdminPageLayout
      title="Lịch sử thao tác"
      description={`${total.toLocaleString("vi-VN")} bản ghi audit`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-gray-400" />
          <Select value={actionFilter} onValueChange={(v: string) => handleFilterChange("action", v)}>
            <SelectTrigger className="w-44 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={(v: string) => handleFilterChange("resource", v)}>
            <SelectTrigger className="w-44 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-gray-500 hover:text-gray-900"
              onClick={() => {
                setActionFilter("ALL");
                setResourceFilter("ALL");
                setPage(1);
              }}
            >
              Xóa lọc
            </Button>
          )}
        </div>
      }
    >
      <Card className={adminPanelClass}>
        {loading ? (
          <AdminSpinner />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <History className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-900">Không có dữ liệu</p>
            <p className="mt-1 text-sm">
              {hasFilter ? "Không tìm thấy bản ghi nào phù hợp với bộ lọc" : "Chưa có lịch sử thao tác"}
            </p>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setActionFilter("ALL"); setResourceFilter("ALL"); setPage(1); }}
                className="mt-3 text-primary"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Thời gian</th>
                  <th className={adminThClass}>Admin</th>
                  <th className={adminThClass}>Hành động</th>
                  <th className={adminThClass}>Đối tượng</th>
                  <th className={adminThClass}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={adminTrClass}>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <div>
                          <p className="text-gray-900 text-sm">{log.admin.firstName} {log.admin.lastName}</p>
                          <p className="text-gray-400 text-xs">{log.admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`font-medium ${ACTION_COLORS[log.action] ?? "border border-gray-200 bg-gray-50 text-gray-700"}`}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-600 text-sm">{RESOURCE_LABELS[log.resource] ?? log.resource}</p>
                        {log.resourceId && (
                          <p className="text-gray-400 text-xs font-mono">{log.resourceId.slice(-8)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs text-left">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="max-w-[200px] truncate" title={log.details ? JSON.stringify(log.details) : ""}>
                          {log.action === "ADJUST_WALLET" && log.details
                            ? <span className="font-medium text-gray-800">
                                {log.details.amount > 0 ? "+" : ""}
                                {Number(log.details.amount).toLocaleString("vi-VN")}₫
                                {log.details.targetName ? ` cho ${log.details.targetName}` : log.resourceId ? ` cho User ...${log.resourceId.slice(-6)}` : ""}
                                {log.details.reason && <span className="font-normal text-gray-500"> ({log.details.reason})</span>}
                              </span>
                            : log.details ? JSON.stringify(log.details) : "—"}
                        </div>
                        {log.details && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 shrink-0 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50" 
                            onClick={() => openLogDetails(log)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={adminPaginationBarClass}>
          <p className="text-sm text-gray-500">
            Trang {page} / {totalPages} ({total.toLocaleString("vi-VN")} bản ghi)
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white border-gray-200 max-w-md sm:max-w-2xl">
          <DialogHeader>
             <DialogTitle className="text-gray-900">Chi tiết thao tác</DialogTitle>
             <DialogDescription className="text-gray-500">
               Được ghi nhận lúc {selectedLog ? new Date(selectedLog.createdAt).toLocaleString("vi-VN") : ""}
             </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            {selectedLog && selectedLog.details && (
              <div className="rounded-xl border border-gray-200 overflow-hidden max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(selectedLog.details).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700 w-1/3 bg-gray-50/50 border-r border-gray-100 align-top">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-gray-600 break-words align-top font-mono text-xs whitespace-pre-wrap">
                          {typeof value === 'object' && value !== null 
                            ? JSON.stringify(value, null, 2) 
                            : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button className="rounded-xl border-gray-200" variant="outline" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
