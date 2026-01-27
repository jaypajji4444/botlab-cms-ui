import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogsApi } from '../../client/blogs';
import { filesApi } from '../../client/files';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Settings, Info } from 'lucide-react';
import ReactQuill from 'react-quill';

// Zod Schema for Blog
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published']),
  metadata: z.any().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill>(null);
  const isEditMode = !!id;

  const [metaJson, setMetaJson] = useState('{}');

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      metadata: {},
    }
  });

  const titleValue = watch('title');

  useEffect(() => {
    if (!isEditMode && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  useEffect(() => {
    if (isEditMode) {
      blogsApi.getById(id).then((data) => {
        if (data) {
           reset({
             title: data.title,
             slug: data.slug,
             content: data.content,
             status: data.status,
             metadata: data.metadata || {},
           });
           setMetaJson(JSON.stringify(data.metadata || {}, null, 2));
        }
      }).catch(err => {

          toast.error("Failed to load blog post");
      });
    }
  }, [id, isEditMode, reset]);

  // Custom Image Handler for Quill
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const toastId = toast.loading('Uploading image to cloud...');
        try {
          const res = await filesApi.uploadImage(file);
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, 'image', res.url);
            quill.setSelection(range.index + 1);
          }
          toast.success('Image uploaded successfully', { id: toastId });
        } catch (error) {
          console.error('Editor image upload failed:', error);
          toast.error('Failed to upload image', { id: toastId });
        }
      }
    };
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const onSubmit = async (data: BlogFormValues) => {
    try {
      let parsedMeta = {};
      try {
        parsedMeta = JSON.parse(metaJson);
      } catch (e) {
        toast.error("Invalid Metadata JSON");
        return;
      }
      console.log('Submitting blog data:', data, 'with metadata:', parsedMeta);

      const payload = { ...data, metadata: parsedMeta };

      if (isEditMode && id) {
        await blogsApi.update(id, payload);
        toast.success('Blog post updated');
      } else {
        await blogsApi.create(payload);
        toast.success('Blog post published successfully');
      }
      navigate('/blogs');
    } catch (error) {
      console.error(error);
      toast.error('Error saving blog post');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center space-x-4">
             <Button variant="ghost" onClick={() => navigate('/blogs')}>
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Blog Post' : 'Write New Blog Post'}</h1>
                <p className="text-sm text-gray-500">Draft your content and refine it for your readers.</p>
             </div>
         </div>
         <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => navigate('/blogs')}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {isEditMode ? 'Save Changes' : 'Publish Blog'}
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title</label>
                    <input 
                      {...register('title')} 
                      className="w-full text-2xl font-bold border-none focus:ring-0 outline-none p-0 placeholder-gray-300" 
                      placeholder="Enter a catchy title..." 
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="h-px bg-gray-100"></div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider text-xs">Content</label>
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
                    {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 sticky top-6">
                <div>
                  <h2 className="font-bold text-gray-900 flex items-center mb-4">
                    <Settings size={18} className="mr-2 text-blue-600"/> Publishing Info
                  </h2>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                        <select 
                          {...register('status')} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Slug URL</label>
                        <div className="flex items-center">
                            <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-gray-500 text-sm">/blog/</span>
                            <input {...register('slug')} className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="article-slug" />
                        </div>
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                <div>
                    <h2 className="font-bold text-gray-900 flex items-center mb-4">
                      <Info size={18} className="mr-2 text-purple-600"/> SEO & Metadata
                    </h2>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Metadata (JSON)</label>
                    <textarea 
                        value={metaJson}
                        onChange={(e) => setMetaJson(e.target.value)}
                        className="w-full h-40 font-mono text-xs border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        placeholder='{"description": "SEO summary...", "tags": ["tech", "ai"]}'
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};