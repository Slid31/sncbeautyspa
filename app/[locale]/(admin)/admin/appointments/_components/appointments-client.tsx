"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Loader2,
  RotateCcw,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAppointmentDetail,
  updateAppointmentStatus,
  type AppointmentRow,
  type AppointmentDetailRow,
} from "../actions";

// ── Badge helpers ──────────────────────────────────────────────────────────────

type Status = AppointmentRow["status"];
type PayStatus = AppointmentRow["paymentStatus"];

const STATUS_STYLE: Record<Status, string> = {
  PENDING:   "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-600",
};

const STATUS_ICON: Record<Status, React.ElementType> = {
  PENDING:   Clock,
  CONFIRMED: CheckCircle2,
  COMPLETED: CheckCircle2,
  CANCELLED: Ban,
};

const PAY_STYLE: Record<PayStatus, string> = {
  PAID:   "border-emerald-200 bg-emerald-50 text-emerald-700",
  UNPAID: "border-slate-200 bg-slate-50 text-slate-500",
};

function StatusBadge({ status, label }: { status: Status; label: string }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1 text-[11px] font-medium", STATUS_STYLE[status])}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function PayBadge({ status, label }: { status: PayStatus; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", PAY_STYLE[status])}
    >
      {label}
    </Badge>
  );
}

// ── Column factory ─────────────────────────────────────────────────────────────

function createColumns(
  t: ReturnType<typeof useTranslations<"admin.appointments">>,
  tDash: ReturnType<typeof useTranslations<"admin.dashboard">>,
  locale: string
): ColumnDef<AppointmentRow>[] {
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return [
    {
      id: "client",
      accessorFn: (r) => `${r.client.firstName} ${r.client.lastName}`,
      header: ({ column }) => <SortHeader column={column} label={t("client")} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.original.client.firstName} {row.original.client.lastName}
          </p>
          <p className="text-xs text-slate-400">{row.original.client.email}</p>
        </div>
      ),
    },
    {
      id: "phone",
      accessorFn: (r) => r.client.phone ?? "",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("phone")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.client.phone ?? "—"}</span>
      ),
    },
    {
      id: "services",
      accessorFn: (r) => r.services.map((s) => s.name).join(", "),
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("services")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="max-w-[180px] line-clamp-2 text-slate-600">
          {row.original.services.map((s) => s.name).join(", ")}
        </span>
      ),
    },
    {
      id: "date",
      accessorFn: (r) => r.date,
      sortingFn: "alphanumeric",
      header: ({ column }) => <SortHeader column={column} label={t("date")} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-slate-600">
          {fmt.format(new Date(row.original.date))}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("status")}
        </span>
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          label={tDash(`appointmentStatus.${row.original.status}`)}
        />
      ),
    },
    {
      id: "paymentStatus",
      accessorFn: (r) => r.paymentStatus,
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("paymentStatus")}
        </span>
      ),
      cell: ({ row }) => (
        <PayBadge
          status={row.original.paymentStatus}
          label={tDash(`paymentStatus.${row.original.paymentStatus}`)}
        />
      ),
    },
    {
      id: "total",
      accessorFn: (r) => parseFloat(r.totalAmount),
      header: ({ column }) => (
        <SortHeader column={column} label={t("total")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <span className="text-right font-semibold text-slate-700 block">
          ${row.original.totalAmount}
        </span>
      ),
    },
  ];
}

// ── Detail Dialog ──────────────────────────────────────────────────────────────

type ConfirmTarget = "COMPLETED" | "CANCELLED" | null;

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  detail: AppointmentDetailRow | null;
  loading: boolean;
  locale: string;
  onStatusUpdated: () => void;
}

function DetailDialog({
  open,
  onOpenChange,
  detail,
  loading,
  locale,
  onStatusUpdated,
}: DetailDialogProps) {
  const t = useTranslations("admin.appointments");
  const tDash = useTranslations("admin.dashboard");
  const [confirmTarget, setConfirmTarget] = React.useState<ConfirmTarget>(null);
  const [updating, setUpdating] = React.useState(false);
  const router = useRouter();

  const fmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [locale]
  );

  async function handleConfirm() {
    if (!detail || !confirmTarget) return;
    setUpdating(true);
    const res = await updateAppointmentStatus(detail.id, confirmTarget, locale);
    setUpdating(false);
    setConfirmTarget(null);
    if (res.ok) {
      toast.success(t("statusUpdated"));
      onOpenChange(false);
      onStatusUpdated();
      router.refresh();
    } else {
      toast.error(t("statusError"));
    }
  }

  return (
    <>
      {/* Main detail dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {t("detailTitle")}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : detail ? (
            <div className="space-y-5 pt-1">
              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge
                  status={detail.status}
                  label={tDash(`appointmentStatus.${detail.status}`)}
                />
                <PayBadge
                  status={detail.paymentStatus}
                  label={tDash(`paymentStatus.${detail.paymentStatus}`)}
                />
              </div>

              {/* Client */}
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                    {t("client")}
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {detail.client.firstName} {detail.client.lastName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {detail.client.email}
                  </div>
                  {detail.client.phone && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {detail.client.phone}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                    {t("date")}
                  </p>
                  <p className="text-sm text-slate-800 capitalize">
                    {fmt.format(new Date(detail.date))}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                    {t("services")}
                  </p>
                  <div className="space-y-1.5">
                    {detail.services.map((svc, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="text-slate-800">{svc.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{svc.duration} min</span>
                        </div>
                        <span className="font-semibold text-slate-700">${svc.price}</span>
                      </div>
                    ))}
                    <Separator className="my-1" />
                    <div className="flex justify-between text-sm font-bold text-slate-900">
                      <span>{t("total")}</span>
                      <span>${detail.totalAmount} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking ref */}
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  {t("bookingRef")}
                </p>
                <p className="text-xs font-mono text-slate-400 break-all">{detail.id}</p>
              </div>

              {/* Intake form responses */}
              {detail.intakeFormResponse ? (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                        {t("intakeResponses")}
                      </p>
                      <div className="space-y-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                        {Object.entries(detail.intakeFormResponse.responses).map(
                          ([key, val]) => (
                            <div key={key}>
                              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                {key}
                              </p>
                              <p className="text-sm text-slate-800 mt-0.5">
                                {val === null || val === undefined
                                  ? "—"
                                  : typeof val === "boolean"
                                  ? val
                                    ? "✓"
                                    : "✗"
                                  : String(val)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Separator />
                  <p className="text-xs text-slate-400 italic">{t("noIntakeForm")}</p>
                </>
              )}

              {/* Status update actions — only for CONFIRMED appointments */}
              {detail.status === "CONFIRMED" && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t("updateStatus")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setConfirmTarget("COMPLETED")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        {t("markCompleted")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmTarget("CANCELLED")}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        {t("markCancelled")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog
        open={confirmTarget !== null}
        onOpenChange={(v) => { if (!v) setConfirmTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("updateStatus")}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget === "CANCELLED"
                ? t("cancellingNote")
                : t("completingNote")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              onClick={handleConfirm}
              className={
                confirmTarget === "CANCELLED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main client component ──────────────────────────────────────────────────────

interface Props {
  appointments: AppointmentRow[];
  locale: string;
}

export function AppointmentsClient({ appointments, locale }: Props) {
  const t = useTranslations("admin.appointments");
  const tDash = useTranslations("admin.dashboard");

  // ── Filter state ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [payFilter, setPayFilter] = React.useState("ALL");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  // ── Detail dialog state ───────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [detail, setDetail] = React.useState<AppointmentDetailRow | null>(null);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (payFilter !== "ALL" && a.paymentStatus !== payFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(a.date) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(a.date) > to) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, payFilter, dateFrom, dateTo]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = React.useMemo(
    () => createColumns(t, tDash, locale),
    [t, tDash, locale]
  );

  // ── Row click → fetch detail ──────────────────────────────────────────────
  async function handleRowClick(row: AppointmentRow) {
    setDetail(null);
    setDialogOpen(true);
    setLoadingDetail(true);
    const d = await getAppointmentDetail(row.id);
    setDetail(d);
    setLoadingDetail(false);
  }

  function resetFilters() {
    setStatusFilter("ALL");
    setPayFilter("ALL");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters =
    statusFilter !== "ALL" || payFilter !== "ALL" || dateFrom || dateTo;

  return (
    <>
      {/* ── Filters ── */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        {/* Status */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("filterStatus")}
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
              <SelectItem value="PENDING">{tDash("appointmentStatus.PENDING")}</SelectItem>
              <SelectItem value="CONFIRMED">{tDash("appointmentStatus.CONFIRMED")}</SelectItem>
              <SelectItem value="COMPLETED">{tDash("appointmentStatus.COMPLETED")}</SelectItem>
              <SelectItem value="CANCELLED">{tDash("appointmentStatus.CANCELLED")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("filterPayment")}
          </label>
          <Select value={payFilter} onValueChange={setPayFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("allPayments")}</SelectItem>
              <SelectItem value="PAID">{tDash("paymentStatus.PAID")}</SelectItem>
              <SelectItem value="UNPAID">{tDash("paymentStatus.UNPAID")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("filterFrom")}
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 text-sm w-[150px]"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("filterTo")}
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 text-sm w-[150px]"
          />
        </div>

        {/* Reset */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            {t("filterReset")}
          </Button>
        )}
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={filtered}
        pageSize={20}
        onRowClick={handleRowClick}
        emptyMessage={t("empty")}
        previousLabel={t("previous")}
        nextLabel={t("next")}
      />

      {/* ── Detail dialog ── */}
      <DetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        detail={detail}
        loading={loadingDetail}
        locale={locale}
        onStatusUpdated={() => setDetail(null)}
      />
    </>
  );
}
