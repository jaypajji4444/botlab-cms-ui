
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video, Settings, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { filesApi } from '../../client/files';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';

// --- Types ---
interface ValueEditorProps {
  type: string;
  value: any;
  onChange: (val: any) => void;
}

// --- Rich Text Editor Component (Reusable) ---
const RichTextEditor: React.FC<ValueEditorProps> = ({ value, onChange }) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const toastId = toast.loading('Uploading image...');
        try {
          const res = await filesApi.uploadImage(file);
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, 'image', res.url);
            quill.setSelection(range.index + 1);
          }
          toast.success('Uploaded', { id: toastId });
        } catch (error) {
          toast.error('Upload failed', { id: toastId });
        }
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'clean'],
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        modules={modules}
        style={{ height: '300px' }}
      />
    </div>
  );
};

// --- Media Editor (Image/Video) ---
const MediaEditor: React.FC<ValueEditorProps & { label?: string }> = ({ type, value, onChange, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const data = typeof value === 'object' && value !== null ? value : { url: value || '' };

  const handleChange = (field: string, val: string) => {
    const newData = { ...data, [field]: val };
    onChange(newData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let response;
      if (type === 'video') {
        response = await filesApi.uploadVideo(file);
      } else {
        response = await filesApi.uploadImage(file);
      }
      
      handleChange('url', response.url);
      toast.success(`${type === 'video' ? 'Video' : 'Image'} uploaded successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
         {label && <label className="block text-xs font-bold text-gray-700 uppercase">{label}</label>}
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={type === 'video' ? 'video/*' : 'image/*'} 
            onChange={handleFileChange}
         />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">{type} Source</label>
        <div className="flex items-center space-x-2">
           <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-400">
              {type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
           </div>
           <input 
             type="text" 
             className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
             value={data.url || ''}
             onChange={(e) => handleChange('url', e.target.value)}
             placeholder={isUploading ? 'Uploading...' : `URL or upload file...`}
             disabled={isUploading}
           />
           <button 
             type="button"
             onClick={() => fileInputRef.current?.click()}
             disabled={isUploading}
             className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
             title={`Upload ${type}`}
           >
             {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
           </button>
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Alt Text / Caption</label>
        <input 
            type="text" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
            value={data.caption || data.alt || ''}
            onChange={(e) => handleChange(type === 'video' ? 'caption' : 'alt', e.target.value)}
            placeholder="Description..."
        />
      </div>

      {data.url && !isUploading && (
        <div className="mt-2 h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
           {type === 'image' ? (
             <img src={data.url} alt="Preview" className="h-full object-contain" />
           ) : (
             <video src={data.url} className="h-full" controls />
           )}
        </div>
      )}
    </div>
  );
};

// --- Button Editor ---
const ButtonEditor: React.FC<ValueEditorProps & { label?: string }> = ({ value, onChange, label }) => {
    const data = typeof value === 'object' && value !== null ? value : { text: '', link: '' };

    const handleChange = (field: string, val: string) => {
        onChange({ ...data, [field]: val });
    };

    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-3">
             {label && <label className="block text-xs font-bold text-gray-700 uppercase">{label}</label>}
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Label</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                        value={data.text || ''}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="Click Here"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Link</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                        value={data.link || ''}
                        onChange={(e) => handleChange('link', e.target.value)}
                        placeholder="/about"
                    />
                 </div>
             </div>
        </div>
    );
}

// --- List Editor with Schema Support ---
interface SchemaField {
    key: string;
    type: 'text' | 'longText' | 'image' | 'video' | 'button' | 'list';
}

const ListEditor: React.FC<ValueEditorProps> = ({ value, onChange }) => {
    const items = Array.isArray(value) ? value : [];
    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(false);

    // Initial Inference
    useEffect(() => {
        if (schema.length === 0 && items.length > 0) {
            const firstItem = items[0];
            const inferredSchema: SchemaField[] = Object.keys(firstItem).map(key => {
                const val = firstItem[key];
                let type: SchemaField['type'] = 'text';
                if (typeof val === 'string' && val.length > 60) type = 'longText';
                else if (Array.isArray(val)) type = 'list';
                else if (typeof val === 'object' && val !== null) {
                        if ('url' in val && key.toLowerCase().includes('video')) type = 'video';
                        else if ('url' in val) type = 'image';
                        else if ('link' in val) type = 'button';
                }
                return { key, type };
            });
            setSchema(inferredSchema);
        } else if (schema.length === 0) {
            setSchema([
                { key: 'title', type: 'text' },
                { key: 'description', type: 'longText' }
            ]);
        }
    }, []); // Only run on mount to avoid loops

    const handleAddItem = () => {
        const newItem: any = {};
        schema.forEach(field => {
            if (field.type === 'text' || field.type === 'longText') newItem[field.key] = '';
            else if (field.type === 'image' || field.type === 'video') newItem[field.key] = { url: '' };
            else if (field.type === 'button') newItem[field.key] = { text: 'Button', link: '#' };
            else if (field.type === 'list') newItem[field.key] = [];
        });
        onChange([...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleUpdateItem = (index: number, key: string, val: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: val };
        onChange(newItems);
    };

    // PHYSICAL SYNC: Deletes the key from all data items
    const handleRemoveField = (idx: number) => {
        const fieldToRemove = schema[idx].key;
        
        // 1. Update Schema UI
        const newSchema = [...schema];
        newSchema.splice(idx, 1);
        setSchema(newSchema);

        // 2. Physical Clean: Remove key from all objects in value array
        const cleanedItems = items.map(item => {
            const newItem = { ...item };
            delete newItem[fieldToRemove];
            return newItem;
        });
        
        // Propagate changes so they are saved to DB without the deleted key
        onChange(cleanedItems);
        toast.success(`Removed field "${fieldToRemove}" and cleaned associated data.`);
    };

    // Rename Field Logic to maintain data integrity
    const handleRenameField = (idx: number, newKey: string) => {
        const oldKey = schema[idx].key;
        if (oldKey === newKey) return;

        // 1. Update Schema UI
        const newSchema = [...schema];
        newSchema[idx].key = newKey;
        setSchema(newSchema);

        // 2. Move data to new key
        const updatedItems = items.map(item => {
            const newItem = { ...item };
            if (oldKey in newItem) {
                newItem[newKey] = newItem[oldKey];
                delete newItem[oldKey];
            }
            return newItem;
        });
        onChange(updatedItems);
    };

    const handleUpdateFieldType = (idx: number, newType: SchemaField['type']) => {
        const newSchema = [...schema];
        newSchema[idx].type = newType;
        setSchema(newSchema);
        // Note: We don't necessarily reset data here to avoid accidental loss, 
        // the visual editor for the item will just switch to the new type.
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <div className="text-xs text-gray-500 italic font-medium">{items.length} items defined in this list</div>
                 <button 
                    type="button" 
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${isConfiguring ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100'}`}
                 >
                     <Settings size={14} className={`mr-1.5 ${isConfiguring ? 'animate-spin-slow' : ''}`} />
                     {isConfiguring ? 'Done Configuring' : 'Configure Schema'}
                 </button>
            </div>

            {isConfiguring && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">List Structure Configuration</h4>
                        <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">MODE: SCHEMA EDITOR</span>
                    </div>
                    
                    <div className="space-y-2">
                        {schema.map((field, idx) => (
                            <div key={idx} className="flex items-center gap-2 group">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={field.key} 
                                        onChange={(e) => handleRenameField(idx, e.target.value)}
                                        className="w-full text-xs font-bold border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                        placeholder="field_key"
                                    />
                                </div>
                                <select 
                                    value={field.type}
                                    onChange={(e) => handleUpdateFieldType(idx, e.target.value as any)}
                                    className="text-xs font-semibold border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                                >
                                    <option value="text">Short Text</option>
                                    <option value="longText">Rich Content</option>
                                    <option value="image">Image Asset</option>
                                    <option value="video">Video Asset</option>
                                    <option value="button">Call to Action</option>
                                    <option value="list">Nested Data</option>
                                </select>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveField(idx)} 
                                    className="p-2 text-blue-300 hover:text-red-500 transition-colors bg-white border border-blue-100 rounded-lg hover:border-red-200"
                                    title="Delete field and clean data"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => setSchema([...schema, { key: `field_${schema.length + 1}`, type: 'text' }])} 
                        className="w-full py-2 bg-white border-2 border-dashed border-blue-200 rounded-lg text-blue-500 text-xs font-bold hover:bg-blue-100/50 hover:border-blue-300 transition-all"
                    >
                         + Add New Field to Schema
                    </button>
                    
                    <p className="text-[10px] text-blue-400 italic">
                        Tip: Removing a field from here physically deletes that key from all items in the list to keep data clean.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {items.length === 0 && !isConfiguring && (
                    <div className="py-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <Plus size={32} className="mb-2 opacity-20" />
                        <span className="text-xs font-medium">List is empty</span>
                        <button type="button" onClick={handleAddItem} className="mt-2 text-blue-600 font-bold text-[10px] hover:underline">Add First Item</button>
                    </div>
                )}
                
                {items.map((item: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                    {index + 1}
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">List Item</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-5">
                            {schema.map((field) => (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">{field.key.replace(/_/g, ' ')}</label>
                                    {field.type === 'text' && (
                                        <input 
                                            type="text" 
                                            value={item[field.key] || ''}
                                            onChange={(e) => handleUpdateItem(index, field.key, e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder={`Enter ${field.key}...`}
                                        />
                                    )}
                                    {field.type === 'longText' && (
                                        <div className="min-h-[100px] border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                            <ReactQuill 
                                                theme="snow"
                                                value={item[field.key] || ''}
                                                onChange={(val) => handleUpdateItem(index, field.key, val)}
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link', 'clean']
                                                    ]
                                                }}
                                            />
                                        </div>
                                    )}
                                    {(field.type === 'image' || field.type === 'video') && (
                                        <MediaEditor type={field.type} value={item[field.key]} onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                    )}
                                    {field.type === 'button' && (
                                        <ButtonEditor value={item[field.key]} type="button" onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                    )}
                                    {field.type === 'list' && (
                                        <div className="pl-4 border-l-2 border-blue-100 mt-2">
                                            <ListEditor type="list" value={item[field.key]} onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {items.length > 0 && (
                    <button 
                        type="button" 
                        onClick={handleAddItem} 
                        className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-100 hover:border-gray-300 transition-all flex items-center justify-center group"
                    >
                        <Plus size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                        Add Another Entry
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main Value Editor Switcher ---
export const ValueEditors: React.FC<ValueEditorProps> = (props) => {
  const { type, value, onChange } = props;
  const [jsonMode, setJsonMode] = useState(false);
  const [internalJson, setInternalJson] = useState('');

  useEffect(() => {
     if (jsonMode && value) {
         setInternalJson(JSON.stringify(value, null, 2));
     }
  }, [jsonMode, value]);

  if (jsonMode || type === 'custom') {
      return (
          <div className="space-y-1">
              <div className="flex justify-end">
                  <button type="button" onClick={() => setJsonMode(false)} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Visual Editor</button>
              </div>
              <textarea 
                  className="w-full font-mono text-xs border rounded-lg p-3 h-48 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-green-400"
                  value={internalJson}
                  onChange={(e) => {
                      setInternalJson(e.target.value);
                      try { onChange(JSON.parse(e.target.value)); } catch(err) {}
                  }}
              />
          </div>
      );
  }

  if (type === 'richText') {
      return <RichTextEditor {...props} />;
  }

  if (type === 'image' || type === 'video') {
      return <MediaEditor {...props} />;
  }

  if (type === 'button') {
      return <ButtonEditor {...props} />;
  }
  
  if (type === 'list') {
      return <ListEditor {...props} />;
  }

  return (
      <div className="space-y-2">
          <div className="flex justify-end">
             <button type="button" onClick={() => setJsonMode(true)} className="text-[10px] font-bold text-gray-300 hover:text-blue-500 uppercase tracking-widest transition-colors">Developer JSON</button>
          </div>
          <textarea 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-28 shadow-sm transition-all"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Content text..."
          />
      </div>
  );
};
