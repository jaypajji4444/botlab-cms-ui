import {
  Image as ImageIcon,
  Loader2,
  Plus,
  Settings,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import { filesApi } from "../../client/files"; // Ensure this path matches

// --- Types ---
interface ValueEditorProps {
  type: string;
  value: any;
  onChange: (val: any) => void;
}

interface SchemaField {
  key: string;
  type: "text" | "longText" | "image" | "video" | "button" | "list";
}

// --- Constants ---
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "clean"],
  ],
};

const SIMPLE_QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

// --- 1. Isolated Quill Component (Prevents heavy re-renders in lists) ---
const MemoizedQuill = React.memo(
  ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    return (
      <div className="min-h-[100px] border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={SIMPLE_QUILL_MODULES}
        />
      </div>
    );
  },
);
MemoizedQuill.displayName = "MemoizedQuill";

// --- 2. Rich Text Editor (Main) ---
const RichTextEditor = React.memo(({ value, onChange }: ValueEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const toastId = toast.loading("Uploading image...");
        try {
          const res = await filesApi.uploadImage(file);
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, "image", res.url);
            quill.setSelection(range.index + 1);
          }
          toast.success("Uploaded", { id: toastId });
        } catch (error) {
          toast.error("Upload failed", { id: toastId });
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      ...QUILL_MODULES,
      toolbar: {
        ...QUILL_MODULES.toolbar,
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler],
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        modules={modules}
        style={{ height: "300px" }}
      />
    </div>
  );
});
RichTextEditor.displayName = "RichTextEditor";

// --- 3. Media Editor (Images/Video) ---
const MediaEditor = React.memo(
  ({ type, value, onChange, label }: ValueEditorProps & { label?: string }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Safe data extraction
    const data =
      typeof value === "object" && value !== null
        ? value
        : { url: value || "" };

    const handleChange = (field: string, val: string) => {
      onChange({ ...data, [field]: val });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const response =
          type === "video"
            ? await filesApi.uploadVideo(file)
            : await filesApi.uploadImage(file);
        handleChange("url", response.url);
        toast.success(
          `${type === "video" ? "Video" : "Image"} uploaded successfully`,
        );
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || `Failed to upload ${type}`,
        );
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    return (
      <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-xs font-bold text-gray-700 uppercase">
              {label}
            </label>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={type === "video" ? "video/*" : "image/*"}
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
            {type} Source
          </label>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-400">
              {type === "video" ? <Video size={16} /> : <ImageIcon size={16} />}
            </div>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
              value={data.url || ""}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder={
                isUploading ? "Uploading..." : `URL or upload file...`
              }
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UploadCloud size={18} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
            Alt Text / Caption
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
            value={data.caption || data.alt || ""}
            onChange={(e) =>
              handleChange(type === "video" ? "caption" : "alt", e.target.value)
            }
            placeholder="Description..."
          />
        </div>

        {data.url && !isUploading && (
          <div className="mt-2 h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200 relative">
            {type === "image" ? (
              <img
                src={data.url}
                alt="Preview"
                className="h-full object-contain"
              />
            ) : (
              <video
                src={data.url}
                className="h-full max-w-full"
                controls
                preload="metadata"
              />
            )}
          </div>
        )}
      </div>
    );
  },
);
MediaEditor.displayName = "MediaEditor";

// --- 4. Button Editor ---
const ButtonEditor = React.memo(
  ({ value, onChange, label }: ValueEditorProps & { label?: string }) => {
    const data =
      typeof value === "object" && value !== null
        ? value
        : { text: "", link: "#" };
    const handleChange = (field: string, val: string) =>
      onChange({ ...data, [field]: val });

    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-3">
        {label && (
          <label className="block text-xs font-bold text-gray-700 uppercase">
            {label}
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
              Label
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={data.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              placeholder="Click Here"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">
              Link
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={data.link || ""}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="/about"
            />
          </div>
        </div>
      </div>
    );
  },
);
ButtonEditor.displayName = "ButtonEditor";

// --- 5. Optimized List Item Row ---
const ListItemRow = React.memo(
  ({ item, index, schema, onUpdate, onRemove }: any) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {index + 1}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Entry
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="p-4 space-y-5">
          {schema.map((field: any) => (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                {field.key.replace(/_/g, " ")}
              </label>

              {/* Text: Ensure safe string value to prevent object crashes */}
              {field.type === "text" && (
                <input
                  type="text"
                  value={
                    typeof item[field.key] === "string" ? item[field.key] : ""
                  }
                  onChange={(e) => onUpdate(index, field.key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}

              {/* LongText: Uses Isolated Memoized Component */}
              {field.type === "longText" && (
                <MemoizedQuill
                  value={
                    typeof item[field.key] === "string" ? item[field.key] : ""
                  }
                  onChange={(val) => onUpdate(index, field.key, val)}
                />
              )}

              {(field.type === "image" || field.type === "video") && (
                <MediaEditor
                  type={field.type}
                  value={item[field.key]}
                  onChange={(val) => onUpdate(index, field.key, val)}
                />
              )}

              {field.type === "button" && (
                <ButtonEditor
                  value={item[field.key]}
                  type="button"
                  onChange={(val) => onUpdate(index, field.key, val)}
                />
              )}

              {field.type === "list" && (
                <div className="pl-4 border-l-2 border-blue-100 mt-2">
                  <ListEditor
                    type="list"
                    value={item[field.key]}
                    onChange={(val) => onUpdate(index, field.key, val)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison to prevent re-renders when functions are recreated
    // This is crucial for performance with complex lists
    return (
      prev.index === next.index &&
      prev.item === next.item && // Shallow check of the item object
      prev.schema === next.schema
    );
  },
);
ListItemRow.displayName = "ListItemRow";

// --- 6. List Editor (Logic Optimized for Performance) ---
const ListEditor: React.FC<ValueEditorProps> = React.memo(
  ({ value, onChange }) => {
    // Ensure items is an array
    const items = Array.isArray(value) ? value : [];

    // Use Ref to hold items to break the dependency cycle in callbacks
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(false);

    // Initial Schema Inference
    useEffect(() => {
      if (schema.length === 0 && items.length > 0) {
        const firstItem = items[0];
        const inferredSchema: SchemaField[] = Object.keys(firstItem).map(
          (key) => {
            const val = firstItem[key];
            let type: SchemaField["type"] = "text";

            // Heuristics for type detection
            if (typeof val === "string" && val.length > 60) type = "longText";
            else if (Array.isArray(val)) type = "list";
            else if (typeof val === "object" && val !== null) {
              // Case insensitive check for Video/Image keys
              if ("url" in val && key.toLowerCase().includes("video"))
                type = "video";
              else if ("url" in val) type = "image";
              else if ("link" in val) type = "button";
            }
            return { key, type };
          },
        );
        setSchema(inferredSchema);
      } else if (schema.length === 0) {
        // Default Fallback
        setSchema([
          { key: "title", type: "text" },
          { key: "description", type: "longText" },
        ]);
      }
    }, [items.length]); // Only re-run if length changes from 0 to 1 ideally

    const handleAddItem = useCallback(() => {
      const newItem: any = {};
      schema.forEach((field) => {
        if (field.type === "text" || field.type === "longText")
          newItem[field.key] = "";
        else if (field.type === "image" || field.type === "video")
          newItem[field.key] = { url: "" };
        else if (field.type === "button")
          newItem[field.key] = { text: "Button", link: "#" };
        else if (field.type === "list") newItem[field.key] = [];
      });
      // Use ref to get latest items without adding dependency
      onChange([...itemsRef.current, newItem]);
    }, [schema, onChange]);

    const handleRemoveItem = useCallback(
      (index: number) => {
        const newItems = itemsRef.current.filter((_, i) => i !== index);
        onChange(newItems);
      },
      [onChange],
    );

    // This callback is now stable and doesn't depend on 'items'
    const handleUpdateItem = useCallback(
      (index: number, key: string, val: any) => {
        const newItems = [...itemsRef.current];
        newItems[index] = { ...newItems[index], [key]: val };
        onChange(newItems);
      },
      [onChange],
    );

    const handleRemoveField = (idx: number) => {
      const fieldToRemove = schema[idx].key;
      setSchema(schema.filter((_, i) => i !== idx));
      onChange(
        itemsRef.current.map((item) => {
          const newItem = { ...item };
          delete newItem[fieldToRemove];
          return newItem;
        }),
      );
      toast.success(`Removed field "${fieldToRemove}"`);
    };

    const handleRenameField = (idx: number, newKey: string) => {
      const oldKey = schema[idx].key;
      if (oldKey === newKey) return;
      setSchema(schema.map((f, i) => (i === idx ? { ...f, key: newKey } : f)));
      onChange(
        itemsRef.current.map((item) => {
          const newItem = { ...item };
          if (oldKey in newItem) {
            newItem[newKey] = newItem[oldKey];
            delete newItem[oldKey];
          }
          return newItem;
        }),
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 italic font-medium">
            {items.length} items
          </div>
          <button
            type="button"
            onClick={() => setIsConfiguring(!isConfiguring)}
            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${isConfiguring ? "bg-blue-600 text-white border-blue-600" : "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100"}`}
          >
            <Settings size={14} className="mr-1.5" />{" "}
            {isConfiguring ? "Done" : "Config"}
          </button>
        </div>

        {isConfiguring && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              {schema.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleRenameField(idx, e.target.value)}
                    className="flex-1 text-xs font-bold border border-blue-200 rounded-lg px-3 py-2"
                    placeholder="field_key"
                  />
                  <select
                    value={field.type}
                    onChange={(e) =>
                      setSchema(
                        schema.map((f, i) =>
                          i === idx ? { ...f, type: e.target.value as any } : f,
                        ),
                      )
                    }
                    className="text-xs font-semibold border border-blue-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="text">Short Text</option>
                    <option value="longText">Rich Content</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="button">CTA</option>
                    <option value="list">Nested List</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="p-2 text-blue-300 hover:text-red-500 bg-white border border-blue-100 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setSchema([
                  ...schema,
                  { key: `field_${schema.length + 1}`, type: "text" },
                ])
              }
              className="w-full py-2 bg-white border-2 border-dashed border-blue-200 rounded-lg text-blue-500 text-xs font-bold"
            >
              + New Field
            </button>
          </div>
        )}

        <div className="space-y-4">
          {items.length === 0 && !isConfiguring && (
            <div className="py-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <Plus size={32} className="mb-2 opacity-20" />
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-600 font-bold text-[10px] hover:underline"
              >
                Add First Item
              </button>
            </div>
          )}
          {/* We map over the array, but Memoized Row prevents re-renders 
                   unless the specific item changes 
                */}
          {items.map((item: any, index: number) => (
            <ListItemRow
              key={index}
              item={item}
              index={index}
              schema={schema}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))}
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-100 flex items-center justify-center"
            >
              <Plus size={16} className="mr-2" /> Add Entry
            </button>
          )}
        </div>
      </div>
    );
  },
);
ListEditor.displayName = "ListEditor";

// --- Main Export ---
export const ValueEditors: React.FC<ValueEditorProps> = (props) => {
  const { type, value, onChange } = props;
  const [jsonMode, setJsonMode] = useState(false);
  const [internalJson, setInternalJson] = useState("");

  useEffect(() => {
    if (jsonMode && value) setInternalJson(JSON.stringify(value, null, 2));
  }, [jsonMode, value]);

  if (jsonMode || type === "custom") {
    return (
      <div className="space-y-1">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setJsonMode(false)}
            className="text-[10px] font-bold text-blue-600 uppercase"
          >
            Visual Editor
          </button>
        </div>
        <textarea
          className="w-full font-mono text-xs border rounded-lg p-3 h-48 outline-none bg-gray-900 text-green-400"
          value={internalJson}
          onChange={(e) => {
            setInternalJson(e.target.value);
            try {
              onChange(JSON.parse(e.target.value));
            } catch (err) {}
          }}
        />
      </div>
    );
  }

  switch (type) {
    case "richText":
      return <RichTextEditor {...props} />;
    case "image":
    case "video":
      return <MediaEditor {...props} />;
    case "button":
      return <ButtonEditor {...props} />;
    case "list":
      return <ListEditor {...props} />;
    default:
      return (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setJsonMode(true)}
              className="text-[10px] font-bold text-gray-300 hover:text-blue-500 uppercase"
            >
              Dev JSON
            </button>
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-28"
            value={
              typeof value === "string" ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => onChange(e.target.value)}
            placeholder="Content text..."
          />
        </div>
      );
  }
};
