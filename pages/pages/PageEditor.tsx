import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pagesApi } from '../../client/pages';
import { sectionsApi } from '../../client/sections';
import { SectionDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, GripVertical, X, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ComponentListEditor } from '../../components/section/ComponentListEditor';

// --- Zod Schema ---
// Component Schema (Simplified)
const componentSchema = z.object({
    name: z.string(),
    slug: z.string(),
    type: z.string(),
    value: z.any(),
    isVisible: z.boolean(),
});

// Section Schema (Object now, not string ID)
const sectionInstanceSchema = z.object({
    name: z.string(),
    slug: z.string(),
    type: z.string(),
    isActive: z.boolean().optional(),
    components: z.array(componentSchema),
    // We can also carry over ID if needed for reference, but for saving we might not strictly need it 
    // if backend creates new instances. Keeping it for tracking.
    id: z.string().optional()
});

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  // Array of full Section objects
  sections: z.array(sectionInstanceSchema), 
  metadata: z.any().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

export const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [availableSections, setAvailableSections] = useState<SectionDto[]>([]);
  const [metaJson, setMetaJson] = useState('{}');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      sections: [],
      metadata: {},
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections"
  });

  useEffect(() => {
    // Load all sections for the picker
    sectionsApi.getAll().then(setAvailableSections).catch(err => toast.error("Failed to load sections"));

    if (isEditMode) {
      pagesApi.getResolvedById(id).then((data) => {
        if (data) {
           reset({
             title: data.title,
             slug: data.slug,
             sections: data.sections || [], // API should now return full objects
           });
           setMetaJson(JSON.stringify(data.metadata || {}, null, 2));
        }
      }).catch(err => {
          console.error(err);
          toast.error("Failed to load page details");
      });
    }
  }, [id, isEditMode, reset]);

  const handleAddSectionTemplate = (templateId: string) => {
    if (!templateId) return;
    const template = availableSections.find(s => s.id === templateId);
    if (template) {
        // Clone the template to create a new instance for this page
        // We might want to remove the 'id' to ensure backend treats it as a new/embedded object
        // or keep it if backend handles duplication. 
        // Based on user request "store section object entirely", we pass the full structure.
        const newSectionInstance = {
            name: template.name,
            slug: template.slug,
            type: template.type,
            isActive: true,
            components: template.components, // Deep copy ideally, but simple spread works for level 1
            // id: template.id // Optional: keep ref if needed, but risky for updates
        };
        append(newSectionInstance);
        
        // Auto expand the new section
        setExpandedSections(prev => ({ ...prev, [fields.length]: true }));
        toast.success(`Added ${template.name} section`);
    }
  };

  const toggleExpand = (index: number) => {
      setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const onSubmit = async (data: PageFormValues) => {
    try {
      let parsedMeta = {};
      try {
        parsedMeta = JSON.parse(metaJson);
      } catch (e) {
        toast.error("Invalid Metadata JSON");
        return;
      }

      const payload = { ...data, metadata: parsedMeta };

      if (isEditMode && id) {
        await pagesApi.update(id, payload);
        toast.success('Page updated');
      } else {
        await pagesApi.create(payload);
        toast.success('Page created');
      }
      navigate('/pages');
    } catch (error) {
      console.error(error);
      toast.error('Error saving page');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center space-x-4">
             <Button variant="ghost" onClick={() => navigate('/pages')}>
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Page' : 'Create New Page'}</h1>
                <p className="text-xs text-gray-500">Compose your page by adding and customizing sections.</p>
             </div>
         </div>
         <div className="flex space-x-2">
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>Save Page</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Page Info & Metadata */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 sticky top-6">
                <h2 className="font-semibold text-gray-900 flex items-center">
                    <Layers size={18} className="mr-2 text-blue-600"/> Page Settings
                </h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                    <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Home Page" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                    <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-2 py-2 text-gray-500 text-sm">/</span>
                        <input {...register('slug')} className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="home" />
                    </div>
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                </div>
                
                <hr className="border-gray-100" />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON)</label>
                    <textarea 
                        value={metaJson}
                        onChange={(e) => setMetaJson(e.target.value)}
                        className="w-full h-40 font-mono text-xs border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        placeholder='{"description": "...", "keywords": []}'
                    />
                </div>
            </div>
        </div>

        {/* Right Column: Section Manager */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Page Content</h2>
                        <p className="text-sm text-gray-500">Manage sections and edit their content for this page.</p>
                    </div>
                    <div className="flex space-x-2">
                        <select 
                            className="text-sm border border-gray-300 rounded-md px-3 py-2 outline-none bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                            onChange={(e) => {
                                handleAddSectionTemplate(e.target.value);
                                e.target.value = '';
                            }}
                        >
                            <option value="">+ Add Section from Template</option>
                            {availableSections.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections-list">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {fields.length === 0 && (
                                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                        <Layers size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">This page is empty.</p>
                                        <p className="text-sm text-gray-400">Select a template above to add your first section.</p>
                                    </div>
                                )}
                                {fields.map((field, index) => {
                                    const isExpanded = expandedSections[index];
                                    return (
                                        <Draggable key={field.id} draggableId={field.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`border rounded-xl transition-all ${isExpanded ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {/* Section Header */}
                                                    <div className="px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(index)}>
                                                        <div className="flex items-center space-x-3">
                                                            <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600 p-1" onClick={e => e.stopPropagation()}>
                                                                <GripVertical size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-800 text-sm">
                                                                    {/* Access form value directly to show updates if name changes */}
                                                                    {/* For simplicity we use the static default from field init, but ideally useWatch if name is editable */}
                                                                    {(field as any).name || 'Untitled Section'}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{(field as any).type}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors" title="Remove Section">
                                                                <X size={18} />
                                                            </button>
                                                            <div className="text-gray-400">
                                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section Content Editor (Collapsible) */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <div className="h-px bg-gray-100 mb-4 mx-2"></div>
                                                            {/* We pass the path to this specific section's components array */}
                                                            <ComponentListEditor 
                                                                control={control} 
                                                                register={register} 
                                                                errors={errors} 
                                                                name={`sections.${index}.components`} 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
      </div>
    </div>
  );
};