import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Columns,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Plus,
  RowsIcon,
  TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { filesApi } from "../client/files";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Enable the full blog toolbar (headings, image upload, tables). Defaults to false for simpler editors. */
  enableBlogFeatures?: boolean;
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${active ? "bg-gray-200 text-black font-bold" : ""}`}
    title={title}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-4 bg-gray-300 mx-1"></div>;

const MenuBar = ({
  editor,
  enableBlogFeatures,
}: {
  editor: any;
  enableBlogFeatures: boolean;
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Listen for edit-link events from the bubble menu
  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent).detail || "";
      setLinkUrl(url);
      setShowLinkInput(true);
      setTimeout(() => linkInputRef.current?.focus(), 50);
    };
    document.addEventListener("tiptap-edit-link", handler);
    return () => document.removeEventListener("tiptap-edit-link", handler);
  }, []);

  if (!editor) {
    return null;
  }

  const openLinkInput = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const saveLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveLink();
    }
    if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkUrl("");
      editor.chain().focus().run();
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const toastId = toast.loading("Uploading image...");
      try {
        const res = await filesApi.uploadImage(file);
        editor.chain().focus().setImage({ src: res.url }).run();
        toast.success("Image inserted", { id: toastId });
      } catch (error) {
        toast.error("Failed to upload image", { id: toastId });
      }
    };
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 rounded-t-xl">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* Headings */}
        {enableBlogFeatures && (
          <>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
            <Divider />
          </>
        )}

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={openLinkInput}
          active={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"
            title="Remove Link"
          >
            <X size={16} />
          </button>
        )}

        {/* Image Upload */}
        {enableBlogFeatures && (
          <>
            <Divider />
            <ToolbarButton onClick={handleImageUpload} title="Insert Image">
              <ImagePlus size={16} />
            </ToolbarButton>
          </>
        )}

        {/* Table controls */}
        {enableBlogFeatures && (
          <>
            <Divider />
            <ToolbarButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              title="Insert Table"
            >
              <TableIcon size={16} />
            </ToolbarButton>

            {editor.isActive("table") && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column"
                >
                  <span className="flex items-center gap-0.5">
                    <Columns size={14} />
                    <Plus size={10} />
                  </span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                >
                  <span className="flex items-center gap-0.5">
                    <Columns size={14} />
                    <Minus size={10} />
                  </span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row"
                >
                  <span className="flex items-center gap-0.5">
                    <RowsIcon size={14} />
                    <Plus size={10} />
                  </span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                >
                  <span className="flex items-center gap-0.5">
                    <RowsIcon size={14} />
                    <Minus size={10} />
                  </span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Table"
                >
                  <Trash2 size={14} className="text-red-400" />
                </ToolbarButton>
              </>
            )}
          </>
        )}
      </div>

      {/* Inline Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            Enter link:
          </span>
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            placeholder="https://example.com"
          />
          <button
            type="button"
            onClick={saveLink}
            className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
              editor.chain().focus().run();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
  enableBlogFeatures = false,
}) => {
  const extensions = useCallback(() => {
    const exts: any[] = [
      StarterKit.configure({
        heading: enableBlogFeatures ? { levels: [1, 2, 3] } : false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
    ];

    if (enableBlogFeatures) {
      exts.push(
        Image.configure({
          HTMLAttributes: {
            class: "rounded-lg max-w-full h-auto my-4",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "tiptap-table",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
      );
    }

    return exts;
  }, [enableBlogFeatures]);

  const editor = useEditor({
    extensions: extensions(),
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base focus:outline-none min-h-[150px] p-4 max-w-none ${enableBlogFeatures ? "tiptap-blog-editor" : ""}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value if changed externally (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.getText() === "" && value === "") return;
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-shadow ${className}`}
    >
      <MenuBar editor={editor} enableBlogFeatures={enableBlogFeatures} />
      <div className="max-h-[400px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Link Bubble Tooltip — shows URL, Edit, Remove when clicking a link */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          shouldShow={({ editor }) => editor.isActive("link")}
        >
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-1.5 text-sm">
            <span className="text-gray-500 font-mono text-xs truncate max-w-[200px]">
              {editor.getAttributes("link").href || ""}
            </span>
            <a
              href={editor.getAttributes("link").href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Open link"
            >
              <ExternalLink size={13} />
            </a>
            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes("link").href || "";
                const menuBar = document.querySelector(
                  ".tiptap-link-edit-trigger",
                );
                // Trigger inline link input in the MenuBar via custom event
                const event = new CustomEvent("tiptap-edit-link", {
                  detail: previousUrl,
                });
                document.dispatchEvent(event);
              }}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <X size={13} />
            </button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
};
