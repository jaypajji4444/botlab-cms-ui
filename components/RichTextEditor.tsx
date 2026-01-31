import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  X,
} from "lucide-react";
import React, { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("bold") ? "bg-gray-200 text-black font-bold" : ""}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("italic") ? "bg-gray-200 text-black" : ""}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("underline") ? "bg-gray-200 text-black" : ""}`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("bulletList") ? "bg-gray-200 text-black" : ""}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("orderedList") ? "bg-gray-200 text-black" : ""}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${editor.isActive("link") ? "bg-gray-200 text-black" : ""}`}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>

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
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base focus:outline-none min-h-[150px] p-4 max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value if changed externally (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if content is drastically different to avoid cursor jumping
      if (editor.getText() === "" && value === "") return;
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-shadow ${className}`}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
