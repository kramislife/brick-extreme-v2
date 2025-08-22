import React, { useEffect, useMemo, useState } from "react";
import ViewLayout from "@/components/admin/shared/ViewLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useDeleteInstructionMutation,
  useGetInstructionsQuery,
} from "@/redux/api/instructionApi";
import { createInstructionColumns } from "@/components/admin/shared/table/columns/InstructionColumns";

const ViewInstructions = () => {
  const { data, isLoading, error } = useGetInstructionsQuery();
  const [deleteInstruction, { isLoading: isDeleting }] =
    useDeleteInstructionMutation();
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  const handleEdit = (instruction) => {
    navigate(`/admin/instructions/${instruction._id}`);
  };

  const handleDelete = async (instruction) => {
    try {
      const res = await deleteInstruction(instruction._id).unwrap();
      toast.success(res?.message || "Instruction deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete instruction");
    }
  };

  const columns = useMemo(
    () => createInstructionColumns(handleEdit, handleDelete, isDeleting),
    [handleEdit, handleDelete, isDeleting]
  );

  const tableData = useMemo(() => {
    const list = data?.instructions || [];
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted.map((i, idx) => ({
      id: idx + 1,
      _id: i._id,
      title: i.title,
      name: i.title,
      product: i.product?._id,
      productName: i.product?.product_name,
      url: i.file?.url,
    }));
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Failed to fetch instructions");
    }
  }, [error]);

  return (
    <ViewLayout
      title="Instructions"
      description="Manage PDF build instructions"
      addNewPath="/admin/instructions/new"
      isLoading={isLoading}
      data={tableData}
      columns={columns}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  );
};

export default ViewInstructions;
