import React from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors, useWatch, Controller } from 'react-hook-form';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ValueEditors } from './ValueEditors';

interface ComponentListEditorProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    name: string; // The path to the components array (e.g. "components" or "sections.0.components")
}

// Wrapper to safely usage useWatch
const ComponentValueField = ({ control, namePrefix, index, value, onChange }: any) => {
    const type = useWatch({
        control,
        name: `${namePrefix}.${index}.type`
    });

    return <ValueEditors type={type} value={value} onChange={onChange} />;
};

export const ComponentListEditor: React.FC<ComponentListEditorProps> = ({ control, register, errors, name }) => {
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: name
    });

    // Utility to get error for a specific field in the dynamic array
    // Uses optional chaining to safely access nested error objects
    const getFieldError = (index: number, fieldName: string) => {
        // This is a simplified check. React Hook Form errors structure matches data structure.
        // If "name" is "sections.0.components", errors will be nested similarly.
        // We'd need lodash.get for full robustness, but for now we rely on the fact that
        // React Hook Form handles deep nesting if we pass the correct string path to register.
        return null; 
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Components</h3>
                <Button type="button" size="sm" variant="secondary" onClick={() => append({ name: 'New Component', slug: `comp-${fields.length + 1}`, type: 'text', isVisible: true, value: '' })}>
                    <Plus size={14} className="mr-2" /> Add Component
                </Button>
            </div>
            
            <div className="space-y-4">
                {fields.length === 0 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">
                        No components in this section. Add one to start.
                    </div>
                )}
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-mono">#{index + 1}</span>
                                <span className="font-medium text-sm text-gray-700">
                                     {/* We can use useWatch here to show live name, but for perf we skip */}
                                     Component
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button type="button" onClick={() => index > 0 && move(index, index - 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronUp size={14}/></button>
                                <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronDown size={14}/></button>
                                <button type="button" onClick={() => remove(index)} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                             {/* Component Header Info */}
                             <div className="md:col-span-4 space-y-3 border-r md:pr-4 border-gray-100">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                    <input {...register(`${name}.${index}.name` as const, { required: true })} className="w-full text-sm border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent" placeholder="Name" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Slug</label>
                                    <input {...register(`${name}.${index}.slug` as const, { required: true })} className="w-full text-sm border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent" placeholder="slug" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                                    <select {...register(`${name}.${index}.type` as const)} className="w-full text-sm border-b border-gray-200 py-1 bg-transparent outline-none cursor-pointer">
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
                                     <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" {...register(`${name}.${index}.isVisible` as const)} className="rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-xs text-gray-600">Visible</span>
                                     </label>
                                </div>
                             </div>

                             {/* Dynamic Value Input */}
                             <div className="md:col-span-8">
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Content Value</label>
                                 <Controller
                                    control={control}
                                    name={`${name}.${index}.value` as const}
                                    render={({ field: { value, onChange } }) => (
                                        <ComponentValueField 
                                            control={control} 
                                            namePrefix={name}
                                            index={index} 
                                            value={value} 
                                            onChange={onChange} 
                                        />
                                    )}
                                 />
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};