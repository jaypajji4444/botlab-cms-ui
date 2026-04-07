import { ComponentListEditor } from "@/components/section/ComponentListEditor";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { layoutsApi } from "../../client/layouts";
import { Button } from "../../components/ui/Button";
import { LayoutType } from "../../types";

const componentSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum([
    "text",
    "image",
    "video",
    "button",
    "richText",
    "custom",
    "list",
  ]),
  value: z.any(),
  isVisible: z.boolean(),
});

const layoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
  isActive: z.boolean().optional(),
  components: z.array(componentSchema),
});

type LayoutFormValues = z.infer<typeof layoutSchema>;

interface LayoutEditorProps {
  type: LayoutType;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const label = type === "header" ? "Header" : "Footer";
  const basePath = type === "header" ? "/header" : "/footer";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutSchema),
    defaultValues: {
      name: "",
      slug: "",
      isActive: true,
      components: [],
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      layoutsApi.getById(id).then((data) => {
        if (data) {
          reset({
            name: data.name,
            slug: data.slug,
            isActive: data.isActive,
            components: data.components,
          });
        }
      });
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: LayoutFormValues) => {
    try {
      const payload = { ...data, type };
      if (isEditMode && id) {
        await layoutsApi.update(id, payload);
        toast.success(`${label} updated successfully`);
      } else {
        await layoutsApi.create(payload);
        toast.success(`${label} created successfully`);
      }
      navigate(basePath);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(basePath)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${label}` : `Create ${label}`}
            </h1>
            <p className="text-xs text-gray-500">
              Define the components for this {label.toLowerCase()} layout.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => navigate(basePath)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Save {label}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`e.g. Main ${label}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                {...register("slug")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`e.g. main-${type}`}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Set as Active
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Components Builder */}
        <ComponentListEditor
          control={control}
          register={register}
          errors={errors}
          name="components"
        />
      </form>
    </div>
  );
};
