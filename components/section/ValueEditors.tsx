import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Video, Type, List as ListIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

// --- Types ---
interface ValueEditorProps {
  type: string;
  value: any;
  onChange: (val: any) => void;
}

// --- Media Editor (Image/Video) ---
const MediaEditor: React.FC<ValueEditorProps> = ({ type, value, onChange }) => {
  const data = typeof value === 'object' ? value : { url: value || '' };

  const handleChange = (field: string, val: string) => {
    const newData = { ...data, [field]: val };
    // If it was just a string before and we only have URL, we could revert to string, 
    // but consistent object is better for CMS.
    onChange(newData);
  };

  return (
    <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{type} URL</label>
        <div className="flex items-center space-x-2">
           <div className="p-2 bg-white border border-gray-300 rounded text-gray-400">
              {type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
           </div>
           <input 
             type="text" 
             className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
             value={data.url || ''}
             onChange={(e) => handleChange('url', e.target.value)}
             placeholder={`https://example.com/file.${type === 'video' ? 'mp4' : 'png'}`}
           />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
         <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alt Text / Caption</label>
            <input 
             type="text" 
             className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
             value={data.caption || data.alt || ''}
             onChange={(e) => handleChange(type === 'video' ? 'caption' : 'alt', e.target.value)}
             placeholder="Description..."
           />
         </div>
      </div>

      {data.url && type === 'image' && (
        <div className="mt-2 h-32 w-full bg-gray-200 rounded flex items-center justify-center overflow-hidden border border-gray-300">
           <img src={data.url} alt="Preview" className="h-full object-contain" />
        </div>
      )}
    </div>
  );
};

// --- Button Editor ---
const ButtonEditor: React.FC<ValueEditorProps> = ({ value, onChange }) => {
    const data = typeof value === 'object' ? value : { text: '', link: '' };

    const handleChange = (field: string, val: string) => {
        onChange({ ...data, [field]: val });
    };

    return (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Button Text</label>
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-white border border-gray-300 rounded text-gray-400"><Type size={16} /></div>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                            value={data.text || ''}
                            onChange={(e) => handleChange('text', e.target.value)}
                            placeholder="Click Here"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link URL</label>
                     <div className="flex items-center space-x-2">
                        <div className="p-2 bg-white border border-gray-300 rounded text-gray-400"><LinkIcon size={16} /></div>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                            value={data.link || ''}
                            onChange={(e) => handleChange('link', e.target.value)}
                            placeholder="/about"
                        />
                    </div>
                 </div>
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Variant</label>
                <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none bg-white"
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

// --- List Editor ---
// Handles an array of objects. Supports simple key-value pairs for now to allow dynamic structures.
const ListEditor: React.FC<ValueEditorProps> = ({ value, onChange }) => {
    const items = Array.isArray(value) ? value : [];
    
    // To simplify, we'll try to detect the schema from the first item, or allow adding generic fields
    const addItem = () => {
        // Add an empty object, user can add fields
        onChange([...items, { title: 'New Item', text: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const updateItem = (index: number, key: string, val: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: val };
        onChange(newItems);
    };

    return (
        <div className="space-y-3">
            {items.map((item: any, idx: number) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative group">
                    <button 
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-2 pr-6">
                        {/* We simply render inputs for all keys found in the object for now */}
                        {Object.keys(item).length === 0 && <p className="text-xs text-gray-400 italic">Empty item</p>}
                        
                        {Object.keys(item).map((key) => (
                            <div key={key} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3 text-xs font-medium text-gray-500 capitalize truncate" title={key}>
                                    {key}
                                </div>
                                <div className="col-span-9">
                                    <input 
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                        value={typeof item[key] === 'string' ? item[key] : JSON.stringify(item[key])}
                                        onChange={(e) => updateItem(idx, key, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        
                        {/* Simple way to add a key if object is empty or user wants more (simplified for this demo) */}
                        <div className="pt-2 flex justify-end">
                            {/* In a full version, we'd have a 'Add Field' button here */}
                        </div>
                    </div>
                </div>
            ))}
            
            <Button type="button" variant="secondary" size="sm" onClick={addItem} className="w-full border-dashed">
                <Plus size={14} className="mr-2" /> Add List Item
            </Button>
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
                  <button type="button" onClick={() => setJsonMode(false)} className="text-xs text-blue-600 hover:underline">Switch to Visual Editor</button>
              </div>
              <textarea 
                  className={`w-full font-mono text-sm border rounded-md p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500' : 'border-gray-300'}`}
                  value={internalJson}
                  onChange={handleJsonChange}
                  placeholder="{}"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
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
      <div className="space-y-1">
          {['list', 'button', 'image', 'video'].includes(type) && (
             <div className="flex justify-end">
                <button type="button" onClick={() => setJsonMode(true)} className="text-xs text-gray-400 hover:text-gray-600">Advanced JSON</button>
             </div>
          )}
          <textarea 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter content..."
          />
      </div>
  );
};