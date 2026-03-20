import { useEffect, useState, useCallback } from "react";
import { History, ChevronLeft, ChevronRight, Shield, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get } from "../../lib/api";
import { toast } from "sonner";

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
  CREATE: "bg-green-500/20 text-green-400",
  UPDATE: "bg-blue-500/20 text-blue-400",
  DELETE: "bg-red-500/20 text-red-400",
  APPROVE: "bg-emerald-500/20 text-emerald-400",
  REJECT: "bg-orange-500/20 text-orange-400",
  BAN: "bg-yellow-500/20 text-yellow-400",
};

const RESOURCE_LABELS: Record<string, string> = {
  category: "Danh mục",
  coupon: "Mã giảm giá",
  account: "Tài khoản",
  review: "Đánh giá",
  seller_request: "Yêu cầu seller",
};

const ACTION_OPTIONS = [
  { value: "ALL", label: "Tất cả hành động" },
  { value: "CREATE", label: "Tạo mới" },
  { value: "UPDATE", label: "Cập nhật" },
  { value: "DELETE", label: "Xóa" },
  { value: "APPROVE", label: "Phê duyệt" },
  { value: "REJECT", label: "Từ chối" },
  { value: "BAN", label: "Khóa tài khoản" },
];

const RESOURCE_OPTIONS = [
  { value: "ALL", label: "Tất cả đối tượng" },
  { value: "account", label: "Tài khoản" },
  { value: "category", label: "Danh mục" },
  { value: "coupon", label: "Mã giảm giá" },
  { value: "review", label: "Đánh giá" },
  { value: "seller_request", label: "Yêu cầu seller" },
];

export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const limit = 50;

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
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3 justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <History className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lịch sử thao tác</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{total} bản ghi</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={(v: string) => handleFilterChange("action", v)}>
            <SelectTrigger className="w-44 bg-foreground/5 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={(v: string) => handleFilterChange("resource", v)}>
            <SelectTrigger className="w-44 bg-foreground/5 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setActionFilter("ALL"); setResourceFilter("ALL"); setPage(1); }}
              className="text-muted-foreground hover:text-foreground"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-foreground/5 border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-border border-t-white rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <History className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg">Không có dữ liệu</p>
            <p className="text-sm mt-1">
              {hasFilter ? "Không tìm thấy bản ghi nào phù hợp với bộ lọc" : "Chưa có lịch sử thao tác"}
            </p>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setActionFilter("ALL"); setResourceFilter("ALL"); setPage(1); }}
                className="mt-3 text-purple-400"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 text-muted-foreground text-sm font-medium">Thời gian</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-medium">Admin</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-medium">Hành động</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-medium">Đối tượng</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-red-400/70" />
                        <div>
                          <p className="text-foreground text-sm">{log.admin.firstName} {log.admin.lastName}</p>
                          <p className="text-muted-foreground text-xs">{log.admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border-0 ${ACTION_COLORS[log.action] ?? "bg-foreground/10 text-muted-foreground"}`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-muted-foreground text-sm">{RESOURCE_LABELS[log.resource] ?? log.resource}</p>
                        {log.resourceId && (
                          <p className="text-muted-foreground text-xs font-mono">{log.resourceId.slice(-8)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
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
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Trang {page} / {totalPages} ({total} bản ghi)</p>
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
    </div>
  );
}
