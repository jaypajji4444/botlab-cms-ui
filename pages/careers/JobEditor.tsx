import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  FileText,
  MapPin,
  Monitor,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { careersApi } from "../../client/careers";
import { Button } from "../../components/ui/Button";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  location: z.string().min(1, "Location is required"),
  department: z.string().min(1, "Department is required"),
  type: z.string().min(1, "Job type is required"),
  experience: z.string().min(1, "Experience is required"),
  workMode: z.string().optional(),
  description: z.string().min(10, "Description is too short"),
  responsibilities: z.string().min(10, "Responsibilities are required"),
  skills: z.string().min(10, "Skills are required"),
  status: z.enum(["draft", "published", "closed"]),
  // Fix: Removed .default(true) to avoid type mismatch in useForm resolver inference.
  // isActive is required in JobFormValues, and default values are handled in useForm.
  isActive: z.boolean(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export const JobEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      slug: "",
      location: "Mumbai, India",
      department: "Engineering",
      type: "Full Time",
      experience: "3+ Years",
      workMode: "On-site",
      description: "",
      responsibilities: "",
      skills: "",
      status: "draft",
      isActive: true,
    },
  });

  const titleValue = watch("title");

  useEffect(() => {
    if (isEditMode && id) {
      careersApi
        .getJobById(id)
        .then((data) => {
          if (data) {
            reset({
              ...data,
              status: data.status || "draft",
              isActive: data.isActive ?? true,
            });
          }
        })
        .catch((err) => toast.error("Failed to load job data"));
    }
  }, [id, isEditMode, reset]);

  useEffect(() => {
    if (!isEditMode && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [titleValue, isEditMode, setValue]);

  const onSubmit = async (data: JobFormValues) => {
    try {
      if (isEditMode && id) {
        await careersApi.updateJob(id, data);
        toast.success("Job posting updated");
      } else {
        await careersApi.createJob(data);
        toast.success("Job posting published");
      }
      navigate("/careers");
    } catch (error) {
      toast.error("Error saving job posting");
    }
  };

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/careers")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Job Opening" : "Create New Opening"}
            </h1>
            <p className="text-xs text-gray-500">
              Define role requirements and candidate expectations.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate("/careers")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditMode ? "Save Changes" : "Publish Opening"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-3">
              Primary Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                  Job Title
                </label>
                <input
                  {...register("title")}
                  className="w-full text-xl font-bold border-b-2 border-gray-100 focus:border-blue-500 outline-none p-0 pb-2 transition-all placeholder-gray-200"
                  placeholder="e.g. Lead of Product Design"
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex items-center">
                  <Building2 size={12} className="mr-1.5" /> Department
                </label>
                <input
                  {...register("department")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Engineering"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex items-center">
                  <MapPin size={12} className="mr-1.5" /> Location
                </label>
                <input
                  {...register("location")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mumbai, India"
                />
              </div>
            </div>
          </div>

          {/* Detailed Sections (Rich Text) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <FileText size={14} className="mr-2 text-blue-500" /> About The
                Role
              </h2>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    className="h-48 mb-12"
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-[10px] mt-2 font-bold">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <Zap size={14} className="mr-2 text-amber-500" /> Key
                Responsibilities
              </h2>
              <Controller
                name="responsibilities"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    className="h-48 mb-12"
                  />
                )}
              />
              {errors.responsibilities && (
                <p className="text-red-500 text-[10px] mt-2 font-bold">
                  {errors.responsibilities.message}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <ShieldCheck size={14} className="mr-2 text-emerald-500" />{" "}
                Skills / Competencies
              </h2>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={quillModules}
                    className="h-48 mb-12"
                  />
                )}
              />
              {errors.skills && (
                <p className="text-red-500 text-[10px] mt-2 font-bold">
                  {errors.skills.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6 sticky top-6">
            <h2 className="font-bold text-gray-900 flex items-center text-sm border-b pb-3 mb-2">
              <Settings size={16} className="mr-2 text-blue-600" /> POSTING
              CONFIG
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">
                  Experience
                </label>
                <div className="relative">
                  <Briefcase
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    {...register("experience")}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="5+ Years"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">
                  Work Mode
                </label>
                <div className="relative">
                  <Monitor
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    {...register("workMode")}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Work From Home"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">
                  Job Type
                </label>
                <select
                  {...register("type")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">
                  Publication Status
                </label>
                <select
                  {...register("status")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-gray-900 text-white"
                >
                  <option value="draft">DRAFT</option>
                  <option value="published">PUBLISHED</option>
                  <option value="closed">CLOSED</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer bg-blue-50/50 p-3 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                      Active Search
                    </span>
                    <span className="text-[9px] text-blue-400">
                      Publicly visible in openings
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              <div className="bg-gray-50 p-3 rounded-xl">
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">
                  Internal Slug
                </label>
                <p className="text-[10px] font-mono text-gray-500 break-all">
                  {watch("slug") || "auto-generated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
