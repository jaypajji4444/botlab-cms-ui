import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionsApi } from '../../client/sections';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { ComponentListEditor } from '@/components/section/ComponentListEditor';


// --- Zod Schemas ---
// Reused in logic but we keep it simple here
const componentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  slug: z.string().min(1, 'Slug is required'),
  type: z.enum(['text', 'image', 'video', 'button', 'richText', 'custom', 'list']),
  value: z.any(),
  isVisible: z.boolean(),
});

const sectionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  type: z.string().min(2, 'Type is required'),
  isActive: z.boolean().optional(),
  components: z.array(componentSchema),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export const SectionEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '',
      isActive: true,
      components: [],
    }
  });

  useEffect(() => {
    if (isEditMode) {
      sectionsApi.getById(id).then((data) => {
        if (data) {
           reset({
             name: data.name,
             slug: data.slug,
             type: data.type,
             isActive: data.isActive,
             components: data.components
           });
        }
      });
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: SectionFormValues) => {
    try {
      if (isEditMode && id) {
        await sectionsApi.update(id, data);
        toast.success('Section updated successfully');
      } else {
        await sectionsApi.create(data);
        toast.success('Section created successfully');
      }
      navigate('/sections');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
             <Button variant="ghost" onClick={() => navigate('/sections')}>
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Section Template' : 'Create Section Template'}</h1>
                <p className="text-xs text-gray-500">Define the default components for this section type.</p>
             </div>
        </div>
        <div className="flex items-center space-x-3">
             <Button variant="secondary" onClick={() => navigate('/sections')}>Cancel</Button>
             <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>Save Section</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                    <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Hero Section" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input {...register('slug')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. hero-section" />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type Category</label>
                    <input {...register('type')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. services, faq" />
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
                <div className="flex items-end pb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" {...register('isActive')} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Set as Active</span>
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