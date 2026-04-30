import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Package
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { returnService, ReturnRequest } from "../../services/return.service";
import { SellerReturnRequestModal } from "../SellerReturnRequestModal";
import { formatCurrency } from "../../lib/currency";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function SellerReturnRequestsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await returnService.getRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-200 animate-pulse";
      case "APPROVED":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "COMPLETED":
        return "bg-green-50 text-green-600 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Chờ xử lý";
      case "APPROVED": return "Đã chấp nhận";
      case "COMPLETED": return "Đã hoàn tất";
      case "REJECTED": return "Đã từ chối";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <RotateCcw className="h-8 w-8 text-blue-600" />
          Yêu cầu trả hàng
        </h1>
        <p className="text-gray-500">Quản lý các yêu cầu trả hàng và hoàn tiền từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="h-5 w-5 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Tổng yêu cầu</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-yellow-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 bg-yellow-50 rounded-bl-xl">
             <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2">Đang chờ xử lý</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500 mb-2">Đã chấp nhận</p>
          <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
        </div>
        <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500 mb-2">Đã hoàn tất</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm theo mã đơn hàng..." 
            className="pl-10 rounded-xl border-gray-200 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ xử lý</option>
              <option value="APPROVED">Đã chấp nhận</option>
              <option value="COMPLETED">Đã hoàn tất</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl"
            onClick={fetchRequests}
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            Đang tải dữ liệu...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không có yêu cầu nào</h3>
            <p className="text-gray-500">Hiện tại chưa có yêu cầu trả hàng nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-200">
                <TableHead className="w-[150px] font-bold text-gray-700">Mã đơn hàng</TableHead>
                <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
                <TableHead className="font-bold text-gray-700">Lý do hoàn</TableHead>
                <TableHead className="font-bold text-gray-700">Số tiền hoàn</TableHead>
                <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-bold text-gray-700">Ngày yêu cầu</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id} className="group border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    #{req.orderId.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {req.user.firstName} {req.user.lastName}
                      </span>
                      <span className="text-[10px] text-gray-500">{req.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-2">
                       <p className="text-sm text-gray-600 line-clamp-1">{req.reason}</p>
                       {req.images.length > 0 && (
                         <Badge variant="outline" className="text-[10px] py-0 px-1 bg-gray-50 whitespace-nowrap">
                           +{req.images.length} ảnh
                         </Badge>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-gray-900">
                    {req.refundAmount ? formatCurrency(req.refundAmount) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full border shadow-none font-bold py-1 px-3 ${getStatusBadgeClass(req.status)}`}>
                      {getStatusText(req.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(req.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        setIsModalOpen(true);
                      }}
                      className="bg-white border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl group-hover:shadow-md transition-all h-9"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                      <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Integration */}
      {selectedRequestId && (
        <SellerReturnRequestModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          requestId={selectedRequestId}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
}
