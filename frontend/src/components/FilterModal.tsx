
// src/components/FilterModal.tsx
import { useEffect } from "react";
import { Modal, Select, Button, Form, DatePicker, Row, Col } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Role, Status } from "../types";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import { userFilterSchema, type UserFilterValues } from "../validation/schemas";

const DATE_FORMAT = "DD MMM YYYY";
const EMPTY_FILTERS: UserFilterValues = { role: "", status: "", fromDate: null, toDate: null };

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    role: Role | "";
    status: Status | "";
    fromDate: string | "";
    toDate: string | "";
  }) => void;
  initialFilters: {
    role: Role | "";
    status: Status | "";
    fromDate: string | "";
    toDate: string | "";
  };
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFilterValues>({
    resolver: zodResolver(userFilterSchema),
    mode: "onChange",
    defaultValues: EMPTY_FILTERS,
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  useEffect(() => {
    if (visible) {
      reset({
        role: initialFilters.role === "SUPERADMIN" ? "" : initialFilters.role,
        status: initialFilters.status,
        fromDate: initialFilters.fromDate ? dayjs(initialFilters.fromDate) : null,
        toDate: initialFilters.toDate ? dayjs(initialFilters.toDate) : null,
      });
    }
  }, [visible, initialFilters, reset]);

  const onSubmit = (values: UserFilterValues) => {
    onApply({
      role: values.role,
      status: values.status,
      // The users filter needs both ends: an open "to" means up to today
      fromDate: values.fromDate ? values.fromDate.format("YYYY-MM-DD") : values.toDate ? "2000-01-01" : "",
      toDate: values.toDate ? values.toDate.format("YYYY-MM-DD") : values.fromDate ? dayjs().format("YYYY-MM-DD") : "",
    });
    onClose();
  };

  const handleReset = () => reset(EMPTY_FILTERS);

  const fieldStatus = (name: keyof UserFilterValues) => ({
    validateStatus: errors[name] ? ("error" as const) : undefined,
    help: errors[name]?.message,
  });

  return (
    <Modal
      className="app-modal"
      title="Filters"
      open={visible}
      onCancel={onClose}
      width={640}
      centered
      footer={[
        <Button key="reset" danger onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          Apply
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Role" {...fieldStatus("role")}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onChange={(v) => field.onChange(v ?? "")}
                    allowClear
                    placeholder="All Roles"
                  >
                    <Select.Option value="ADMIN">Admin</Select.Option>
                    <Select.Option value="USER">User</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Status" {...fieldStatus("status")}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onChange={(v) => field.onChange(v ?? "")}
                    allowClear
                    placeholder="All Status"
                  >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="Inactive">Inactive</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Joined date: separate From / To pickers (single-month calendar) */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="From date" {...fieldStatus("fromDate")}>
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(d) => field.onChange(d ?? null)}
                    format={DATE_FORMAT}
                    placeholder="Select date"
                    prefix={<CalendarDays size={16} />}
                    suffixIcon={null}
                    allowClear
                    style={{ width: "100%" }}
                    classNames={{ popup: { root: "app-date-popup" } }}
                    disabledDate={(d) => d.isAfter(dayjs(), "day") || (!!toDate && d.isAfter(toDate, "day"))}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="To date" {...fieldStatus("toDate")}>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(d) => field.onChange(d ?? null)}
                    format={DATE_FORMAT}
                    placeholder="Select date"
                    prefix={<CalendarDays size={16} />}
                    suffixIcon={null}
                    allowClear
                    style={{ width: "100%" }}
                    classNames={{ popup: { root: "app-date-popup" } }}
                    disabledDate={(d) => d.isAfter(dayjs(), "day") || (!!fromDate && d.isBefore(fromDate, "day"))}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
