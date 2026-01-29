import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Info,
  ListTree,
  Loader2,
  Plus,
  Settings,
  Tag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { blogsApi } from "../../client/blogs";
import { filesApi } from "../../client/files";
import { Button } from "../../components/ui/Button";

// Zod Schema for Blog
const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const tocSchema = z.object({
  text: z.string(),
  id: z.string(),
  level: z.number().optional(),
});

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]),
  category: z.string().min(1, "Category is required"),
  preview: z.string().optional(),
  isIndexable: z.boolean().optional(),
  metadata: z.any().optional(),
  faqs: z.array(faqSchema).optional(),
  tableOfContent: z.array(tocSchema).optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!id;

  const [metaJson, setMetaJson] = useState("{}");
  const [isPreviewUploading, setIsPreviewUploading] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<
    { text: string; level: number }[]
  >([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      status: "draft",
      category: "Technology",
      preview: "",
      isIndexable: true,
      metadata: {},
      faqs: [],
      tableOfContent: [],
    },
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faqs",
  });

  const titleValue = watch("title");
  const previewUrl = watch("preview");
  const contentValue = watch("content");

  // Automatically update detected headers for UI feedback
  useEffect(() => {
    if (!contentValue) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentValue, "text/html");
    const headers = doc.querySelectorAll("h2, h3");
    const list = Array.from(headers).map((h) => ({
      text: h.textContent || "",
      level: parseInt(h.tagName.substring(1)),
    }));
    setDetectedHeaders(list);
  }, [contentValue]);

  useEffect(() => {
    if (!isEditMode && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  useEffect(() => {
    if (isEditMode) {
      blogsApi
        .getById(id)
        .then((data) => {
          if (data) {
            reset({
              title: data.title,
              slug: data.slug,
              content: data.content,
              status: data.status,
              category: data.category || "Technology",
              preview: data.preview || "",
              isIndexable: data.isIndexable ?? true,
              metadata: data.metadata || {},
              faqs: data.faqs || [],
              tableOfContent: data.tableOfContent || [],
            });
            setMetaJson(JSON.stringify(data.metadata || {}, null, 2));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load blog post");
        });
    }
  }, [id, isEditMode, reset]);

  const handlePreviewUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreviewUploading(true);
    const toastId = toast.loading("Uploading preview image...");
    try {
      const res = await filesApi.uploadImage(file);
      setValue("preview", res.url);
      toast.success("Preview image updated", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsPreviewUploading(false);
      if (previewInputRef.current) previewInputRef.current.value = "";
    }
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const toastId = toast.loading("Uploading editor image...");
        try {
          const res = await filesApi.uploadImage(file);
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, "image", res.url);
            quill.setSelection(range.index + 1);
          }
          toast.success("Image inserted", { id: toastId });
        } catch (error) {
          toast.error("Failed to upload image", { id: toastId });
        }
      }
    };
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );

  // Automated Content Processing: IDs and TOC
  const processBlogContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headers = doc.querySelectorAll("h2, h3");
    const toc: { text: string; id: string; level: number }[] = [];

    headers.forEach((header, index) => {
      const text = header.textContent || "";
      // Create a slug from text, fallback to index-based if empty
      let baseId = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (!baseId) baseId = `heading-${index}`;

      header.setAttribute("id", baseId);

      toc.push({
        text,
        id: baseId,
        level: parseInt(header.tagName.substring(1)),
      });
    });

    return {
      processedHtml: doc.body.innerHTML,
      tableOfContent: toc,
    };
  };

  const onSubmit = async (data: BlogFormValues) => {
    try {
      let parsedMeta = {};
      try {
        parsedMeta = JSON.parse(metaJson);
      } catch (e) {
        toast.error("Invalid Metadata JSON");
        return;
      }

      // Automatically handle ToC and Header IDs
      const { processedHtml, tableOfContent } = processBlogContent(
        data.content,
      );

      const payload = {
        ...data,
        content: processedHtml,
        tableOfContent,
        metadata: parsedMeta,
      };

      if (isEditMode && id) {
        await blogsApi.update(id, payload as any);
        toast.success("Blog post updated");
      } else {
        await blogsApi.create(payload as any);
        toast.success("Blog post published");
      }
      navigate("/blogs");
    } catch (error) {
      console.error(error);
      toast.error("Error saving blog post");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/blogs")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Blog Post" : "Write New Blog Post"}
            </h1>
            <p className="text-xs text-gray-500">
              Draft your content and manage publication settings.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate("/blogs")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditMode ? "Save Changes" : "Publish Blog"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Main Content Block */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Blog Title
              </label>
              <input
                {...register("title")}
                className="w-full text-2xl font-bold border-none focus:ring-0 outline-none p-0 placeholder-gray-300"
                placeholder="Enter a catchy title..."
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="h-px bg-gray-100"></div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                Body Content
              </label>
              <div className="min-h-[500px]">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={quillModules}
                      placeholder="Start writing your amazing story..."
                    />
                  )}
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.content.message}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
                * Header IDs and Table of Contents will be generated
                automatically upon save.
              </p>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <HelpCircle className="mr-2 text-blue-500" size={20} />{" "}
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add Q&A pairs to appear at the end of the blog.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => appendFaq({ question: "", answer: "" })}
              >
                <Plus size={14} className="mr-1.5" /> Add FAQ
              </Button>
            </div>

            <div className="space-y-4">
              {faqFields.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <HelpCircle
                    size={32}
                    className="mx-auto text-gray-200 mb-2"
                  />
                  <p className="text-xs font-medium text-gray-400">
                    No FAQs added for this post.
                  </p>
                </div>
              )}
              {faqFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group animate-in slide-in-from-left-2 duration-200"
                >
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Question {index + 1}
                      </label>
                      <input
                        {...register(`faqs.${index}.question` as const)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ask something..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Answer
                      </label>
                      <textarea
                        {...register(`faqs.${index}.answer` as const)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20"
                        placeholder="Provide a helpful answer..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 sticky top-6 overflow-hidden">
            {/* Featured Image */}
            <div>
              <h2 className="font-bold text-gray-900 flex items-center text-sm border-b pb-3 mb-4">
                <ImageIcon size={16} className="mr-2 text-pink-500" /> FEATURED
                IMAGE
              </h2>
              <div className="space-y-3">
                <div
                  className="group relative h-40 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                  onClick={() => previewInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      {isPreviewUploading ? (
                        <Loader2
                          size={24}
                          className="animate-spin text-blue-500 mx-auto"
                        />
                      ) : (
                        <>
                          <UploadCloud
                            size={24}
                            className="text-gray-300 mx-auto mb-2"
                          />
                          <p className="text-[10px] text-gray-500 font-bold uppercase">
                            Upload Listing Preview
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={previewInputRef}
                    onChange={handlePreviewUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <input
                  {...register("preview")}
                  className="w-full text-[10px] font-mono border border-gray-200 rounded px-2 py-1 outline-none bg-gray-50 text-gray-400"
                  placeholder="Image URL..."
                />
              </div>
            </div>

            {/* ToC Status */}
            <div>
              <h2 className="font-bold text-gray-900 flex items-center text-sm border-b pb-3 mb-4">
                <ListTree size={16} className="mr-2 text-emerald-600" /> TOC
                STRUCTURE
              </h2>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {detectedHeaders.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">
                    No H2 or H3 headers detected yet.
                  </p>
                ) : (
                  detectedHeaders.map((h, i) => (
                    <div
                      key={i}
                      className={`flex items-start space-x-2 ${h.level === 3 ? "ml-4" : ""}`}
                    >
                      <div
                        className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${h.level === 2 ? "bg-emerald-400" : "bg-emerald-200"}`}
                      />
                      <span className="text-[10px] font-medium text-gray-600 truncate">
                        {h.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h2 className="font-bold text-gray-900 flex items-center text-sm border-b pb-3 mb-4">
                <Settings size={16} className="mr-2 text-blue-600" /> POST
                SETTINGS
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                    <Tag size={12} className="mr-1" /> Category
                  </label>
                  <input
                    {...register("category")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Technology"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-semibold"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-400 text-xs font-mono">
                      /blog/
                    </span>
                    <input
                      {...register("slug")}
                      className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      placeholder="article-slug"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      {...register("isIndexable")}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-700 uppercase flex items-center">
                        <Globe size={10} className="mr-1" /> SEO Indexing
                      </span>
                      <span className="text-[9px] text-gray-400">
                        Allow search engine discovery
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div>
              <h2 className="font-bold text-gray-900 flex items-center text-sm mb-4">
                <Info size={16} className="mr-2 text-purple-600" /> JSON
                METADATA
              </h2>
              <textarea
                value={metaJson}
                onChange={(e) => setMetaJson(e.target.value)}
                className="w-full h-40 font-mono text-[10px] border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                placeholder='{"description": "SEO summary...", "tags": ["tech", "ai"]}'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
