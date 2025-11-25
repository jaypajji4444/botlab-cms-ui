import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionsApi } from '../../client/sections';
import { CreateSectionDto, ComponentType } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

// --- Zod Schemas ---
const componentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  slug: z.string().min(1, 'Slug is required'),
  type: z.enum(['text', 'image', 'video', 'button', 'richText', 'custom', 'list']),
  value: z.any(), // Flexible
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

// --- Helper Component for Dynamic Values ---
const ValueEditor = ({ type, value, onChange }: { type: ComponentType, value: any, onChange: (val: any) => void }) => {
    const [jsonError, setJsonError] = React.useState<string | null>(null);
    const [internalJson, setInternalJson] = React.useState('');

    // Sync internal JSON state when value changes externally (if it's an object/array)
    useEffect(() => {
        if ((type === 'list' || type === 'custom') && typeof value === 'object') {
            setInternalJson(JSON.stringify(value, null, 2));
        }
    }, [value, type]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const str = e.target.value;
        setInternalJson(str);
        try {
            const parsed = JSON.parse(str);
            setJsonError(null);
            onChange(parsed);
        } catch (err) {
            setJsonError("Invalid JSON");
        }
    };

    if (type === 'text' || type === 'richText' || type === 'button') {
        // For button, we might need an object {text, link}, but for simplicity let's assume simple string or use JSON for complex button
        if (type === 'button') {
             return (
                <div className="space-y-2">
                    <p className="text-xs text-gray-500">Format: JSON Object</p>
                    <textarea 
                        className={`w-full font-mono text-sm border rounded p-2 h-24 ${jsonError ? 'border-red-500' : 'border-gray-300'}`}
                        value={internalJson || (typeof value === 'object' ? JSON.stringify(value, null, 2) : value)}
                        onChange={handleJsonChange}
                        placeholder='{"text": "Click Me", "link": "/path"}'
                    />
                     {jsonError && <p className="text-red-500 text-xs">{jsonError}</p>}
                </div>
             )
        }
        return (
            <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder="Enter text content..."
            />
        );
    }
    
    if (type === 'image' || type === 'video') {
         // Assuming simple string URL or object structure. Let's support string URL for simplicity or JSON for complex.
         // If value is a string, show input.
         const isString = typeof value === 'string' || !value;
         
         if (isString) {
             return (
                 <div className="space-y-2">
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={`Enter ${type} URL...`}
                    />
                    {value && type === 'image' && (
                        <div className="mt-2 h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                            <img src={value} alt="Preview" className="h-full object-contain" />
                        </div>
                    )}
                 </div>
             );
         }
         // Fallback to JSON if it's complex object
    }

    // Default for 'list', 'custom', or complex structures
    return (
        <div className="space-y-1">
            <textarea 
                className={`w-full font-mono text-sm border rounded-md p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none ${jsonError ? 'border-red-500' : 'border-gray-300'}`}
                value={internalJson}
                onChange={handleJsonChange}
                placeholder="Enter valid JSON..."
            />
            {jsonError && <p className="text-red-500 text-xs">{jsonError}</p>}
            <p className="text-xs text-gray-400">JSON Mode enabled for complex data structures.</p>
        </div>
    );
}


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

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'components',
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
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Section' : 'Create New Section'}</h1>
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Components</h2>
                <Button type="button" size="sm" onClick={() => append({ name: 'New Component', slug: `comp-${fields.length + 1}`, type: 'text', isVisible: true, value: '' })}>
                    <Plus size={16} className="mr-2" /> Add Component
                </Button>
            </div>
            
            <div className="space-y-4">
                {fields.length === 0 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                        No components added yet. Click "Add Component" to start building.
                    </div>
                )}
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <GripVertical className="text-gray-400 cursor-grab" size={16} />
                                <span className="font-medium text-sm text-gray-700">Component #{index + 1}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button type="button" onClick={() => index > 0 && move(index, index - 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronUp size={16}/></button>
                                <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronDown size={16}/></button>
                                <button type="button" onClick={() => remove(index)} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                             {/* Component Header Info */}
                             <div className="md:col-span-3 space-y-3 border-r md:pr-4 border-gray-100">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                    <input {...register(`components.${index}.name` as const)} className="w-full text-sm border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent" placeholder="Name" />
                                    {errors.components?.[index]?.name && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Slug</label>
                                    <input {...register(`components.${index}.slug` as const)} className="w-full text-sm border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent" placeholder="slug" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                                    <select {...register(`components.${index}.type` as const)} className="w-full text-sm border-b border-gray-200 py-1 bg-transparent outline-none cursor-pointer">
                                        <option value="text">Text</option>
                                        <option value="richText">Rich Text</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="button">Button</option>
                                        <option value="list">List (Complex)</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                     <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register(`components.${index}.isVisible` as const)} className="rounded text-blue-600" />
                                        <span className="text-xs text-gray-600">Visible</span>
                                     </label>
                                </div>
                             </div>

                             {/* Dynamic Value Input */}
                             <div className="md:col-span-9">
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Content Value</label>
                                 <Controller
                                    control={control}
                                    name={`components.${index}.value` as const}
                                    render={({ field: { value, onChange } }) => {
                                        // Need to watch the type to render correct input
                                        // eslint-disable-next-line react-hooks/rules-of-hooks
                                        const type = useWatch({ control, name: `components.${index}.type` });
                                        return <ValueEditor type={type as ComponentType} value={value} onChange={onChange} />;
                                    }}
                                 />
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </form>
    </div>
  );
};
