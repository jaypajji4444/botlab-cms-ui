import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Hash,
  Loader2,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { filesApi } from "../../client/files";
import { reportsApi } from "../../client/reports";
import { Button } from "../../components/ui/Button";

const reportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional(),
  year: z.string().min(1, "Year is required"),
  date: z.string().min(1, "Date is required"),
  fileUrl: z.string().url("A valid PDF URL is required"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export const ReportEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      category: "Financial",
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split("T")[0],
      fileUrl: "",
    },
  });

  const fileUrl = watch("fileUrl");

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoadingReport(true);
      reportsApi
        .getById(id)
        .then((data) => {
          if (data) {
            reset({
              title: data.title,
              category: data.category || "Financial",
              year: data.year,
              date: data.date.split("T")[0], // Ensure date format works with input[type=date]
              fileUrl: data.fileUrl,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load report data");
          navigate("/reports");
        })
        .finally(() => {
          setIsLoadingReport(false);
        });
    }
  }, [id, isEditMode, reset, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading report PDF...");
    try {
      const res = await filesApi.uploadFile(file);
      setValue("fileUrl", res.url, { shouldValidate: true });
      toast.success("PDF uploaded successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload PDF", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    try {
      if (isEditMode && id) {
        await reportsApi.update(id, data);
        toast.success("Report updated successfully");
      } else {
        await reportsApi.create(data);
        toast.success("Report successfully added");
      }
      navigate("/reports");
    } catch (error) {
      console.error(error);
      toast.error("Error saving report");
    }
  };

  if (isLoadingReport) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium tracking-tight">
          Loading report data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/reports")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Report" : "Add New Report"}
            </h1>
            <p className="text-xs text-gray-500">
              Provide document details and upload the PDF file.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Report Title
              </label>
              <input
                {...register("title")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="e.g. Annual Return 2024"
              />
              {errors.title && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                <Tag size={12} className="mr-1" /> Category
              </label>
              <input
                {...register("category")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Financial"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                <Hash size={12} className="mr-1" /> Year
              </label>
              <input
                {...register("year")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2025"
              />
              {errors.year && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                <Calendar size={12} className="mr-1" /> Report Date
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.date && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2"></div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Upload Document (PDF)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${fileUrl ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`}
              onClick={() => !fileUrl && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2
                  className="animate-spin text-blue-500 mb-2"
                  size={32}
                />
              ) : fileUrl ? (
                <>
                  <div className="h-16 w-16 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-center text-green-600 mb-3">
                    <FileText size={32} />
                  </div>
                  <p className="text-sm font-bold text-green-700">
                    PDF Uploaded
                  </p>
                  <p className="text-[10px] text-green-500 font-mono mt-1 max-w-xs truncate">
                    {fileUrl.split("/").pop()}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("fileUrl", "");
                    }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-red-500 border border-gray-100 shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud size={40} className="text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-600">
                    Click to upload report PDF
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    S3 bucket integration will handle storage.
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="application/pdf"
              />
            </div>
            {errors.fileUrl && (
              <p className="text-red-500 text-[10px] mt-2 font-bold text-center">
                {errors.fileUrl.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="px-8"
              onClick={() => navigate("/reports")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="px-12"
              isLoading={isSubmitting}
              disabled={isUploading}
            >
              {isEditMode ? "Update Report" : "Publish Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
