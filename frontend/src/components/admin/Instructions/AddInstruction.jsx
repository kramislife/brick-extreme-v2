import React, { useMemo, useState } from "react";
import Metadata from "@/components/layout/Metadata/Metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateInstructionMutation } from "@/redux/api/instructionApi";
import { useGetProductsQuery } from "@/redux/api/productApi";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AddInstruction = () => {
  const navigate = useNavigate();
  const [createInstruction, { isLoading }] = useCreateInstructionMutation();
  const { data: products } = useGetProductsQuery();
  const productOptions = useMemo(
    () =>
      (products?.allProducts || []).map((p) => ({
        id: p._id,
        name: `${p.product_name} - ${p.itemID || "N/A"}`,
      })),
    [products]
  );

  const [form, setForm] = useState({ product: "", title: "", file: null });

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
    setForm((prev) => ({ ...prev, file: b64 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.title || !form.file) {
      toast.error("Please fill all fields and upload a PDF");
      return;
    }
    try {
      const res = await createInstruction(form).unwrap();
      toast.success(res?.message || "Instruction created");
      navigate("/admin/instructions");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create instruction");
    }
  };

  return (
    <>
      <Metadata title="Add Instruction" />
      <div className="p-3 md:p-5">
        <form onSubmit={handleSubmit}>
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="text-2xl">Add New Instruction</CardTitle>
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
                PDF File
              </Label>
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                required
              />
              {form.file && (
                <p className="text-sm text-gray-500">PDF selected</p>
              )}

              <div className="flex justify-end">
                <Button
                  variant="submit"
                  type="submit"
                  className="w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating Instruction...
                    </>
                  ) : (
                    "Create Instruction"
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

export default AddInstruction;
