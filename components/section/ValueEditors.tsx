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

    useEffect(() => {
        if (schema.length === 0) {
            if (items.length > 0) {
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
            } else {
                setSchema([
                    { key: 'title', type: 'text' },
                    { key: 'description', type: 'longText' }
                ]);
            }
        }
    }, [items, schema.length]);

    const handleAddItem = () => {
        const newItem: any = {};
        schema.forEach(field => {
            if (field.type === 'text' || field.type === 'longText') newItem[field.key] = '';
            if (field.type === 'image' || field.type === 'video') newItem[field.key] = { url: '' };
            if (field.type === 'button') newItem[field.key] = { text: 'Button', link: '#' };
            if (field.type === 'list') newItem[field.key] = [];
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <div className="text-xs text-gray-500 italic">{items.length} items defined</div>
                 <button 
                    type="button" 
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                 >
                     <Settings size={12} className="mr-1" />
                     {isConfiguring ? 'Hide Configuration' : 'Configure Fields'}
                 </button>
            </div>

            {isConfiguring && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="text-sm font-bold text-blue-900">List Structure (Schema)</h4>
                    {schema.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={field.key} 
                                onChange={(e) => {
                                    const newSchema = [...schema];
                                    newSchema[idx].key = e.target.value;
                                    setSchema(newSchema);
                                }}
                                className="flex-1 text-xs border border-blue-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none"
                            />
                            <select 
                                value={field.type}
                                onChange={(e) => {
                                    const newSchema = [...schema];
                                    newSchema[idx].type = e.target.value as any;
                                    setSchema(newSchema);
                                }}
                                className="text-xs border border-blue-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="text">Short Text</option>
                                <option value="longText">Long Text</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="button">Button</option>
                                <option value="list">Nested List</option>
                            </select>
                            <button type="button" onClick={() => {
                                const newSchema = [...schema];
                                newSchema.splice(idx, 1);
                                setSchema(newSchema);
                            }} className="p-1.5 text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <Button type="button" size="sm" variant="secondary" onClick={() => setSchema([...schema, { key: `field_${schema.length + 1}`, type: 'text' }])} className="w-full">
                         + Add Field
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {items.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group">
                        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Item #{index + 1}</span>
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {schema.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{field.key}</label>
                                    {field.type === 'text' && (
                                        <input 
                                            type="text" 
                                            value={item[field.key] || ''}
                                            onChange={(e) => handleUpdateItem(index, field.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                        />
                                    )}
                                    {field.type === 'longText' && (
                                        <textarea 
                                            value={item[field.key] || ''}
                                            onChange={(e) => handleUpdateItem(index, field.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none h-20"
                                        />
                                    )}
                                    {(field.type === 'image' || field.type === 'video') && (
                                        <MediaEditor type={field.type} value={item[field.key]} onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                    )}
                                    {field.type === 'button' && (
                                        <ButtonEditor value={item[field.key]} type="button" onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                    )}
                                    {field.type === 'list' && (
                                        /*  Pass the correct 'type' prop to nested ListEditor */
                                        <ListEditor type="list" value={item[field.key]} onChange={(val) => handleUpdateItem(index, field.key, val)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddItem} className="w-full border-dashed py-3">
                    + Add Item
                </Button>
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
                  <button type="button" onClick={() => setJsonMode(false)} className="text-xs text-blue-600 hover:underline">Visual Editor</button>
              </div>
              <textarea 
                  className="w-full font-mono text-sm border rounded-md p-2 h-40 outline-none focus:ring-2 focus:ring-blue-500"
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
             <button type="button" onClick={() => setJsonMode(true)} className="text-xs text-gray-400">JSON</button>
          </div>
          <textarea 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Content text..."
          />
      </div>
  );
};