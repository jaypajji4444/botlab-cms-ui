import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pagesApi } from '../../client/pages';
import { sectionsApi } from '../../client/sections';
import { SectionDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, GripVertical, X, ExternalLink } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// --- Zod Schema ---
const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  sections: z.array(z.string()), // Array of Section IDs
  metadata: z.any().optional(), // Simply handling as JSON for now
});

type PageFormValues = z.infer<typeof pageSchema>;

export const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [availableSections, setAvailableSections] = useState<SectionDto[]>([]);
  // We maintain a local state for ordered sections to handle drag/drop visually before syncing to form
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [metaJson, setMetaJson] = useState('{}');

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      sections: [],
      metadata: {},
    }
  });

  useEffect(() => {
    // Load all sections for the picker
    sectionsApi.getAll().then(setAvailableSections).catch(err => toast.error("Failed to load sections"));

    if (isEditMode) {
      pagesApi.getById(id).then((data) => {
        if (data) {
           reset({
             title: data.title,
             slug: data.slug,
           });
           setSelectedSectionIds(data.sections || []);
           setMetaJson(JSON.stringify(data.metadata || {}, null, 2));
           setValue('sections', data.sections || []);
        }
      }).catch(err => toast.error("Failed to load page details"));
    }
  }, [id, isEditMode, reset, setValue]);

  const handleAddSection = (sectionId: string) => {
    if (!sectionId) return;
    if (selectedSectionIds.includes(sectionId)) {
        toast.error("Section already added");
        return;
    }
    const newIds = [...selectedSectionIds, sectionId];
    setSelectedSectionIds(newIds);
    setValue('sections', newIds, { shouldDirty: true });
  };

  const handleRemoveSection = (index: number) => {
    const newIds = [...selectedSectionIds];
    newIds.splice(index, 1);
    setSelectedSectionIds(newIds);
    setValue('sections', newIds, { shouldDirty: true });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(selectedSectionIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedSectionIds(items);
    setValue('sections', items, { shouldDirty: true });
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center space-x-4">
             <Button variant="ghost" onClick={() => navigate('/pages')}>
                <ArrowLeft size={20} />
             </Button>
             <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Page' : 'Create New Page'}</h1>
         </div>
         <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>Save Page</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Page Info & Metadata */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-semibold text-gray-900">Page Details</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <div className="flex items-center">
                        <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-2 py-2 text-gray-500 text-sm">/</span>
                        <input {...register('slug')} className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-semibold text-gray-900">Metadata (SEO)</h2>
                <textarea 
                    value={metaJson}
                    onChange={(e) => setMetaJson(e.target.value)}
                    className="w-full h-40 font-mono text-xs border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder='{"description": "...", "keywords": []}'
                />
            </div>
        </div>

        {/* Right Column: Section Manager */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-gray-900">Page Sections</h2>
                    <div className="flex space-x-2">
                        <select 
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 outline-none"
                            onChange={(e) => {
                                handleAddSection(e.target.value);
                                e.target.value = '';
                            }}
                        >
                            <option value="">+ Add Existing Section</option>
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
                                className="space-y-3"
                            >
                                {selectedSectionIds.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                        No sections assigned. Add sections to build your page.
                                    </div>
                                )}
                                {selectedSectionIds.map((secId, index) => {
                                    const section = availableSections.find(s => s.id === secId);
                                    return (
                                        <Draggable key={secId} draggableId={secId} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between group hover:border-blue-300 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{section?.name || 'Loading...'}</p>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-xs text-gray-500">{section?.type} • {section?.slug}</p>
                                                                {section && (
                                                                    <Link 
                                                                        to={`/sections/edit/${section.id}`}
                                                                        target="_blank"
                                                                        className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
                                                                        title="Edit Section in new tab"
                                                                    >
                                                                        <ExternalLink size={10} className="mr-0.5" /> Edit
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveSection(index)} className="text-gray-400 hover:text-red-500">
                                                        <X size={18} />
                                                    </button>
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
