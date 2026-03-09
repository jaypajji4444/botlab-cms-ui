import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { portfoliosApi } from '../../client/portfolios';
import { sectionsApi } from '../../client/sections';
import { SectionDto, ComponentType } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, GripVertical, X, ChevronDown, ChevronUp, Briefcase, Settings, Info } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ComponentListEditor } from '../../components/section/ComponentListEditor';

const componentSchema = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.enum(['text', 'image', 'video', 'button', 'richText', 'custom', 'list']),
  value: z.any().optional(),
  isVisible: z.boolean(),
});

const sectionInstanceSchema = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  isActive: z.boolean().optional(),
  components: z.array(componentSchema),
  id: z.string().optional()
});

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  isIndexable: z.boolean().optional(),
  sections: z.array(sectionInstanceSchema),
  metadata: z.any().optional(),
  status: z.enum(['draft', 'published']).optional(),
  numberOfDrones: z.coerce.number().optional(),
  showDuration: z.string().optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export const PortfolioEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [availableSections, setAvailableSections] = useState<SectionDto[]>([]);
  const [metaJson, setMetaJson] = useState('{}');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'Corporate',
      location: 'India',
      isIndexable: true,
      sections: [],
      metadata: {},
      status: 'draft',
      numberOfDrones: undefined,
      showDuration: '',
    }
  });

  const titleValue = watch('title');
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections"
  });

  useEffect(() => {
    sectionsApi.getAll().then(setAvailableSections).catch(err => toast.error("Failed to load sections"));

    if (isEditMode) {
      portfoliosApi.getById(id).then((data) => {
        if (data) {
          reset({
            title: data.title,
            slug: data.slug,
            category: data.category,
            location: data.location,
            isIndexable: data.isIndexable ?? true,
            sections: data.sections || [],
            status: (data as any).status || 'draft',
            numberOfDrones: (data as any).numberOfDrones || undefined,
            showDuration: (data as any).showDuration || '',
          });
          const meta = data.metadata || {} as any;
          setSeoTitle(meta.SEOTitle || '');
          setSeoDescription(meta.Desc || '');
          const { SEOTitle, Desc, ...restMeta } = meta;
          setMetaJson(JSON.stringify(restMeta, null, 2));
        }
      }).catch(err => {
        toast.error("Failed to load portfolio details");
      });
    }
  }, [id, isEditMode, reset]);

  useEffect(() => {
    if (!isEditMode && titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  const handleAddSectionTemplate = (templateId: string) => {
    const template = availableSections.find(s => s.id === templateId);
    if (template) {
      append({
        name: template.name,
        slug: template.slug,
        type: template.type,
        isActive: true,
        components: template.components.map(c => ({
          name: c.name,
          slug: c.slug,
          type: c.type as ComponentType,
          value: c.value ?? '',
          isVisible: c.isVisible
        })),
        id: template.id
      } as any);
      setExpandedSections(prev => ({ ...prev, [fields.length]: true }));
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    try {
      let parsedMeta: Record<string, unknown> = {};
      try { parsedMeta = JSON.parse(metaJson); } catch (e) {
        toast.error("Invalid Metadata JSON");
        return;
      }

      const fullMeta = {
        ...(seoTitle ? { SEOTitle: seoTitle } : {}),
        ...(seoDescription ? { Desc: seoDescription } : {}),
        ...parsedMeta,
      };

      const payload = {
        ...data,
        sections: data.sections.map(s => ({
          ...s,
          components: s.components.map(c => ({ ...c, type: c.type as ComponentType }))
        })),
        metadata: fullMeta as Record<string, unknown>
      };

      if (isEditMode && id) {
        await portfoliosApi.update(id, payload as any);
        toast.success('Portfolio updated');
      } else {
        await portfoliosApi.create(payload as any);
        toast.success('Portfolio item created');
      }
      navigate('/portfolios');
    } catch (error) {
      toast.error('Error saving portfolio item');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
            <p className="text-xs text-gray-500">Define project details and build the visual layout.</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>Save Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 sticky top-6">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <Briefcase size={18} className="mr-2 text-blue-600" /> Project Settings
            </h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Project Title</label>
              <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Drone Light Show 2024" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Slug URL</label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-2 py-2 text-gray-500 text-sm">/portfolio/</span>
                <input {...register('slug')} className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="drone-light-show" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                <input {...register('category')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location</label>
                <input {...register('location')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Number of Drones</label>
                <input type="number" {...register('numberOfDrones')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Show Duration</label>
                <input {...register('showDuration')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 8 minutes" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-semibold"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-100">
                <input type="checkbox" {...register('isIndexable')} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">Allow Search Indexing</span>
              </label>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">SEO Title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter SEO title..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">SEO Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-vertical"
                placeholder="Enter SEO description..."
              />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Additional Metadata (JSON)</label>
              <textarea
                value={metaJson}
                onChange={(e) => setMetaJson(e.target.value)}
                className="w-full h-32 font-mono text-[10px] border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                placeholder='{"Schema": {...}}'
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Portfolio Content</h2>
                <p className="text-sm text-gray-500">Build the layout for this showcase project.</p>
              </div>
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-2 outline-none bg-blue-50 text-blue-700 font-medium cursor-pointer"
                onChange={(e) => {
                  handleAddSectionTemplate(e.target.value);
                  e.target.value = '';
                }}
              >
                <option value="">+ Add Section</option>
                {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="portfolio-sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {fields.length === 0 && (
                      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No sections added.</p>
                      </div>
                    )}
                    {fields.map((field, index) => {
                      const isExpanded = expandedSections[index];
                      return (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={`border rounded-xl transition-all ${isExpanded ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSections(p => ({ ...p, [index]: !p[index] }))}>
                                <div className="flex items-center space-x-3">
                                  <div {...provided.dragHandleProps} className="text-gray-400 p-1" onClick={e => e.stopPropagation()}>
                                    <GripVertical size={18} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{(field as any).name}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{(field as any).type}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 p-1">
                                    <X size={16} />
                                  </button>
                                  <div className="text-gray-400">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <hr className="mb-4 border-gray-100" />
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