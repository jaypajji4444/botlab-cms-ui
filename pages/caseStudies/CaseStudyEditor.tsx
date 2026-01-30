import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { caseStudiesApi } from "../../client/caseStudies";
import { filesApi } from "../../client/files";
import { Button } from "../../components/ui/Button";
// Added Settings to the import list from lucide-react
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Settings,
  Tag,
  UploadCloud,
} from "lucide-react";

const caseStudySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  fileUrl: z.string().url("A valid PDF URL is required"),
  preview: z.string().url("A valid preview image URL is required"),
  description: z.string().optional(),
  // Fix: Removed .default(true) to avoid type mismatch in useForm resolver inference where it clashed with partial/optional requirements
  isActive: z.boolean(),
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export const CaseStudyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "Technology",
      date: new Date().toISOString().split("T")[0],
      fileUrl: "",
      preview: "",
      description: "",
      isActive: true,
    },
  });

  const titleValue = watch("title");
  const previewUrl = watch("preview");
  const pdfUrl = watch("fileUrl");

  useEffect(() => {
    if (isEditMode && id) {
      setLoadingData(true);
      caseStudiesApi
        .getById(id)
        .then((data) => {
          if (data) {
            reset({
              ...data,
              date: data.date.split("T")[0], // Extract just YYYY-MM-DD for input
            });
          }
        })
        .catch((err) => {
          toast.error("Failed to load case study data");
          navigate("/case-studies");
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, reset, navigate]);

  useEffect(() => {
    if (!isEditMode && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    const toastId = toast.loading("Uploading cover image...");
    try {
      const res = await filesApi.uploadImage(file);
      setValue("preview", res.url, { shouldValidate: true });
      toast.success("Cover image uploaded", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setIsUploadingPdf(true);
    const toastId = toast.loading("Uploading PDF document...");
    try {
      const res = await filesApi.uploadFile(file);
      setValue("fileUrl", res.url, { shouldValidate: true });
      toast.success("PDF document uploaded", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload PDF", { id: toastId });
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CaseStudyFormValues) => {
    try {
      if (isEditMode && id) {
        await caseStudiesApi.update(id, data);
        toast.success("Case study updated");
      } else {
        await caseStudiesApi.create(data);
        toast.success("Case study published successfully");
      }
      navigate("/case-studies");
    } catch (error) {
      toast.error("Error saving case study");
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">
          Loading case study details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/case-studies")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Case Study" : "New Case Study"}
            </h1>
            <p className="text-xs text-gray-500">
              Curate success stories and technological breakthroughs.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate("/case-studies")}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            disabled={isUploadingImage || isUploadingPdf}
          >
            {isEditMode ? "Save Changes" : "Publish Case Study"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Content */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-4 flex items-center">
              <Globe size={14} className="mr-2 text-blue-500" /> General
              Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Title
                </label>
                <input
                  {...register("title")}
                  className="w-full text-xl font-bold border-b-2 border-gray-100 focus:border-blue-500 outline-none p-0 pb-2 transition-all placeholder-gray-200"
                  placeholder="e.g. Revolutionizing Logistics with Drone Swarms"
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                    <Tag size={12} className="mr-1.5" /> Category
                  </label>
                  <input
                    {...register("category")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Technology"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                    <Calendar size={12} className="mr-1.5" /> Event Date
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Brief Description
                </label>
                <textarea
                  {...register("description")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32"
                  placeholder="Summary of the case study for the listing view..."
                />
              </div>
            </div>
          </div>

          {/* Asset Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Uploader */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <FileText size={14} className="mr-2 text-red-500" /> Case Study
                PDF
              </h2>
              <div
                className={`relative h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${pdfUrl ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50"}`}
                onClick={() => pdfInputRef.current?.click()}
              >
                {isUploadingPdf ? (
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                ) : pdfUrl ? (
                  <div className="text-center p-4">
                    <CheckCircle2
                      size={32}
                      className="text-green-500 mx-auto mb-2"
                    />
                    <p className="text-xs font-bold text-green-700">
                      Document Uploaded
                    </p>
                    <p className="text-[9px] text-green-400 font-mono mt-1 break-all">
                      {pdfUrl.split("/").pop()}
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs font-bold text-gray-500">
                      Click to upload PDF
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={pdfInputRef}
                  className="hidden"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                />
              </div>
              {errors.fileUrl && (
                <p className="text-red-500 text-[10px] mt-2 font-bold text-center">
                  {errors.fileUrl.message}
                </p>
              )}
            </div>

            {/* Image Uploader */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <ImageIcon size={14} className="mr-2 text-pink-500" /> Cover
                Image
              </h2>
              <div
                className="relative h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center"
                onClick={() => imageInputRef.current?.click()}
              >
                {isUploadingImage ? (
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                ) : previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Change Image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs font-bold text-gray-500">
                      Upload Preview
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              {errors.preview && (
                <p className="text-red-500 text-[10px] mt-2 font-bold text-center">
                  {errors.preview.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6 sticky top-6">
            <h2 className="font-bold text-gray-900 flex items-center text-sm border-b pb-3 mb-2">
              <Settings size={16} className="mr-2 text-blue-600" />{" "}
              CONFIGURATION
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">
                  Internal Slug
                </label>
                <div className="relative">
                  <LinkIcon
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    {...register("slug")}
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer bg-blue-50/50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                      Active Status
                    </span>
                    <span className="text-[9px] text-blue-400">
                      Visibility on the main website
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Asset Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-medium">
                  PDF Document
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${pdfUrl ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-medium">
                  Cover Image
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${previewUrl ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`}
                />
              </div>
            </div>

            {isEditMode && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 text-center font-mono">
                  Case Study ID: {id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
