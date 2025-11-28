import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Video, Type, List as ListIcon, MoreHorizontal, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';

// --- Types ---
interface ValueEditorProps {
  type: string;
  value: any;
  onChange: (val: any) => void;
}

// --- Media Editor (Image/Video) ---
const MediaEditor: React.FC<ValueEditorProps & { label?: string }> = ({ type, value, onChange, label }) => {
  const data = typeof value === 'object' ? value : { url: value || '' };

  const handleChange = (field: string, val: string) => {
    const newData = { ...data, [field]: val };
    onChange(newData);
  };

  return (
    <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      {label && <label className="block text-xs font-bold text-gray-700 uppercase">{label}</label>}
      <div>
        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">{type} URL</label>
        <div className="flex items-center space-x-2">
           <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-400">
              {type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
           </div>
           <input 
             type="text" 
             className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
             value={data.url || ''}
             onChange={(e) => handleChange('url', e.target.value)}
             placeholder={`https://example.com/file.${type === 'video' ? 'mp4' : 'png'}`}
           />
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

      {data.url && type === 'image' && (
        <div className="mt-2 h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
           <img src={data.url} alt="Preview" className="h-full object-contain" />
        </div>
      )}
    </div>
  );
};

// --- Button Editor ---
const ButtonEditor: React.FC<ValueEditorProps & { label?: string }> = ({ value, onChange, label }) => {
    const data = typeof value === 'object' ? value : { text: '', link: '' };

    const handleChange = (field: string, val: string) => {
        onChange({ ...data, [field]: val });
    };

    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-3">
             {label && <label className="block text-xs font-bold text-gray-700 uppercase">{label}</label>}
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Label</label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                            value={data.text || ''}
                            onChange={(e) => handleChange('text', e.target.value)}
                            placeholder="Click Here"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Link</label>
                     <div className="flex items-center space-x-2">
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
             <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Variant</label>
                <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none bg-white focus:border-blue-500"
                    value={data.variant || 'primary'}
                    onChange={(e) => handleChange('variant', e.target.value)}
                >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                </select>
             </div>
        </div>
    );
}

// --- List Editor with Schema Support ---
interface SchemaField {
    key: string;
    type: 'text' | 'longText' | 'image' | 'video' | 'button';
}

const ListEditor: React.FC<ValueEditorProps> = ({ value, onChange }) => {
    const items = Array.isArray(value) ? value : [];
    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(false);

    // Initialize Schema from data if present, else default
    useEffect(() => {
        if (schema.length === 0) {
            if (items.length > 0) {
                const firstItem = items[0];
                const inferredSchema: SchemaField[] = Object.keys(firstItem).map(key => {
                    const val = firstItem[key];
                    let type: SchemaField['type'] = 'text';
                    
                    if (typeof val === 'string' && val.length > 60) type = 'longText';
                    else if (typeof val === 'object' && val !== null) {
                         if ('url' in val && key.toLowerCase().includes('video')) type = 'video';
                         else if ('url' in val) type = 'image';
                         else if ('link' in val) type = 'button';
                    }
                    else if (key.toLowerCase().includes('video')) type = 'video';
                    else if (key.toLowerCase().includes('image') || key.toLowerCase().includes('img')) type = 'image';

                    return { key, type };
                });
                setSchema(inferredSchema);
            } else {
                // Default schema for new lists
                setSchema([
                    { key: 'title', type: 'text' },
                    { key: 'description', type: 'longText' }
                ]);
            }
        }
    }, []); // Run once on mount

    const handleAddItem = () => {
        const newItem: any = {};
        schema.forEach(field => {
            if (field.type === 'text' || field.type === 'longText') newItem[field.key] = '';
            if (field.type === 'image' || field.type === 'video') newItem[field.key] = { url: '' };
            if (field.type === 'button') newItem[field.key] = { text: 'Button', link: '#' };
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

    // Schema Actions
    const addSchemaField = () => {
        setSchema([...schema, { key: `field_${schema.length + 1}`, type: 'text' }]);
    };

    const removeSchemaField = (idx: number) => {
        const newSchema = [...schema];
        newSchema.splice(idx, 1);
        setSchema(newSchema);
    };

    const updateSchemaField = (idx: number, field: Partial<SchemaField>) => {
        const newSchema = [...schema];
        newSchema[idx] = { ...newSchema[idx], ...field };
        setSchema(newSchema);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                 <div className="text-xs text-gray-500 italic">
                     {items.length} items defined
                 </div>
                 <button 
                    type="button" 
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                 >
                     <Settings size={12} className="mr-1" />
                     {isConfiguring ? 'Hide Configuration' : 'Configure Fields'}
                 </button>
            </div>

            {/* Schema Configuration Panel */}
            {isConfiguring && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="text-sm font-bold text-blue-900">List Structure (Schema)</h4>
                    <p className="text-xs text-blue-700 mb-2">Define what fields each item in your list should have.</p>
                    
                    {schema.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={field.key} 
                                onChange={(e) => updateSchemaField(idx, { key: e.target.value })}
                                className="flex-1 text-xs border border-blue-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none"
                                placeholder="Field Name (e.g. title)"
                            />
                            <select 
                                value={field.type}
                                onChange={(e) => updateSchemaField(idx, { type: e.target.value as any })}
                                className="text-xs border border-blue-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="text">Text (Short)</option>
                                <option value="longText">Text (Long)</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="button">Button</option>
                            </select>
                            <button 
                                type="button" 
                                onClick={() => removeSchemaField(idx)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    
                    <Button type="button" size="sm" variant="secondary" onClick={addSchemaField} className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                        <Plus size={14} className="mr-1" /> Add Field
                    </Button>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
                {items.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group">
                        {/* Item Header */}
                        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item #{index + 1}</span>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveItem(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-gray-200"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Item Fields */}
                        <div className="p-4 space-y-4">
                            {schema.map((field) => (
                                <div key={field.key}>
                                    {field.type === 'text' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{field.key}</label>
                                            <input 
                                                type="text" 
                                                value={item[field.key] || ''}
                                                onChange={(e) => handleUpdateItem(index, field.key, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                                                placeholder={`Enter ${field.key}...`}
                                            />
                                        </div>
                                    )}
                                    {field.type === 'longText' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{field.key}</label>
                                            <textarea 
                                                value={item[field.key] || ''}
                                                onChange={(e) => handleUpdateItem(index, field.key, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all h-20"
                                                placeholder={`Enter ${field.key}...`}
                                            />
                                        </div>
                                    )}
                                    {(field.type === 'image' || field.type === 'video') && (
                                        <MediaEditor 
                                            type={field.type}
                                            label={field.key}
                                            value={item[field.key]}
                                            onChange={(val) => handleUpdateItem(index, field.key, val)}
                                        />
                                    )}
                                    {field.type === 'button' && (
                                        <ButtonEditor 
                                            label={field.key}
                                            value={item[field.key]}
                                            type="button"
                                            onChange={(val) => handleUpdateItem(index, field.key, val)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <Button type="button" variant="secondary" onClick={handleAddItem} className="w-full border-dashed py-3">
                    <Plus size={16} className="mr-2" /> Add Item
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     if (jsonMode && value) {
         setInternalJson(JSON.stringify(value, null, 2));
     }
  }, [jsonMode, value]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInternalJson(val);
      try {
          const parsed = JSON.parse(val);
          setError(null);
          onChange(parsed);
      } catch(err) {
          setError("Invalid JSON");
      }
  };

  if (jsonMode || type === 'custom') {
      return (
          <div className="space-y-1">
              <div className="flex justify-end">
                  <button type="button" onClick={() => setJsonMode(false)} className="text-xs text-blue-600 hover:underline font-medium">Switch to Visual Editor</button>
              </div>
              <textarea 
                  className={`w-full font-mono text-sm border rounded-md p-2 h-40 focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500' : 'border-gray-300'}`}
                  value={internalJson}
                  onChange={handleJsonChange}
                  placeholder="{}"
              />
              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          </div>
      );
  }

  // Visual Editors
  if (type === 'image' || type === 'video') {
      return <MediaEditor {...props} />;
  }

  if (type === 'button') {
      return <ButtonEditor {...props} />;
  }
  
  if (type === 'list') {
      return <ListEditor {...props} />;
  }

  // Default Text / Rich Text
  return (
      <div className="space-y-2">
          {['list', 'button', 'image', 'video'].includes(type) && (
             <div className="flex justify-end">
                <button type="button" onClick={() => setJsonMode(true)} className="text-xs text-gray-400 hover:text-gray-600">Switch to JSON</button>
             </div>
          )}
          <textarea 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 transition-all"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter content text..."
          />
      </div>
  );
};