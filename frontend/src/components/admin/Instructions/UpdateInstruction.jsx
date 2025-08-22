import React, { useEffect, useMemo, useState } from "react";
import Metadata from "@/components/layout/Metadata/Metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, BookOpen, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetInstructionsQuery,
  useReplaceInstructionFileMutation,
  useUpdateInstructionMutation,
} from "@/redux/api/instructionApi";
import { useGetProductsQuery } from "@/redux/api/productApi";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UpdateInstruction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useGetInstructionsQuery();
  const target = data?.instructions?.find((i) => i._id === id);

  const [updateInstruction, { isLoading: isUpdating }] =
    useUpdateInstructionMutation();
  const [replaceFile, { isLoading: isReplacing }] =
    useReplaceInstructionFileMutation();
  const { data: products } = useGetProductsQuery();

  const productOptions = useMemo(
    () =>
      (products?.allProducts || []).map((p) => ({
        id: p._id,
        name: p.product_name,
      })),
    [products]
  );

  const [form, setForm] = useState({ product: "", title: "" });

  useEffect(() => {
    if (target) {
      setForm({
        product: target.product?._id || "",
        title: target.title || "",
      });
    }
  }, [target]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    const b64 = await toBase64(f);
    try {
      const res = await replaceFile({ id, file: b64 }).unwrap();
      toast.success(res?.message || "File replaced");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to replace file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateInstruction({ id, ...form }).unwrap();
      toast.success(res?.message || "Instruction updated");
      navigate("/admin/instructions");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update instruction");
    }
  };

  return (
    <>
      <Metadata title="Update Instruction" />
      <div className="p-3 md:p-5">
        <form onSubmit={handleSubmit}>
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="text-2xl">Update Instruction</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <Label
                htmlFor="product"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                Product
              </Label>
              <select
                id="product"
                name="product"
                value={form.product}
                onChange={handleChange}
                className="w-full bg-gray-100 p-2 rounded"
                required
              >
                <option value="">Select product</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <Label
                htmlFor="title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <BookOpen className="h-5 w-5 text-purple-600" />
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter instruction title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <Label
                htmlFor="file"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <FileText className="h-5 w-5 text-green-600" />
                Replace PDF File
              </Label>
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={handleFile}
              />
              {target?.file?.url && (
                <p className="text-sm text-gray-500">
                  Current:{" "}
                  <a
                    className="underline"
                    href={target.file.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View PDF
                  </a>
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  variant="submit"
                  type="submit"
                  className="w-auto"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default UpdateInstruction;
