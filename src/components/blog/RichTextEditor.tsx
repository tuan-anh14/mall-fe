/**
 * RichTextEditor — A custom WYSIWYG editor built with contentEditable + execCommand.
 * Provides: Bold, Italic, Underline, Strikethrough, H1, H2, H3,
 *           Bullet list, Ordered list, Blockquote, Link, Code block,
 *           Text align, Horizontal rule, Insert image by URL.
 *
 * NOTE: Once @tiptap packages are installed with:
 *   yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align
 * This component can be replaced by a TipTap implementation for a richer experience.
 */
import React, { useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolbarButton {
  icon: React.ReactNode;
  title: string;
  command: string;
  value?: string;
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Bắt đầu viết nội dung bài viết...',
  minHeight = 400,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value → contentEditable (only on mount / external reset)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []); // intentionally run only on mount

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value ?? undefined);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  }, [onChange]);

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML ?? '');
  }, [onChange]);

  const handleInsertLink = useCallback(() => {
    const url = window.prompt('Nhập URL liên kết:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const handleInsertImage = useCallback(() => {
    const url = window.prompt('Nhập URL ảnh:', 'https://');
    if (url) exec('insertImage', url);
  }, [exec]);

  const toolbarRows: (ToolbarButton | 'divider')[][] = [
    [
      { icon: <Bold size={16} />, title: 'In đậm (Ctrl+B)', command: 'bold' },
      { icon: <Italic size={16} />, title: 'In nghiêng (Ctrl+I)', command: 'italic' },
      { icon: <Underline size={16} />, title: 'Gạch chân (Ctrl+U)', command: 'underline' },
      { icon: <Strikethrough size={16} />, title: 'Gạch ngang', command: 'strikeThrough' },
      'divider',
      { icon: <Heading1 size={16} />, title: 'Tiêu đề 1', command: 'formatBlock', value: 'H1' },
      { icon: <Heading2 size={16} />, title: 'Tiêu đề 2', command: 'formatBlock', value: 'H2' },
      { icon: <Heading3 size={16} />, title: 'Tiêu đề 3', command: 'formatBlock', value: 'H3' },
      'divider',
      { icon: <List size={16} />, title: 'Danh sách', command: 'insertUnorderedList' },
      { icon: <ListOrdered size={16} />, title: 'Danh sách có số', command: 'insertOrderedList' },
      { icon: <Quote size={16} />, title: 'Trích dẫn', command: 'formatBlock', value: 'BLOCKQUOTE' },
      { icon: <Code size={16} />, title: 'Code block', command: 'formatBlock', value: 'PRE' },
      'divider',
      { icon: <AlignLeft size={16} />, title: 'Căn trái', command: 'justifyLeft' },
      { icon: <AlignCenter size={16} />, title: 'Căn giữa', command: 'justifyCenter' },
      { icon: <AlignRight size={16} />, title: 'Căn phải', command: 'justifyRight' },
      'divider',
      { icon: <Minus size={16} />, title: 'Đường kẻ ngang', command: 'insertHorizontalRule' },
      'divider',
      { icon: <RotateCcw size={16} />, title: 'Undo (Ctrl+Z)', command: 'undo' },
      { icon: <RotateCw size={16} />, title: 'Redo (Ctrl+Y)', command: 'redo' },
    ],
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
        {toolbarRows[0].map((item, idx) => {
          if (item === 'divider') return <Divider key={`d-${idx}`} />;
          const btn = item as ToolbarButton;
          return (
            <button
              key={idx}
              type="button"
              title={btn.title}
              onMouseDown={e => {
                e.preventDefault(); // prevent focus loss
                if (btn.command === 'createLink') {
                  handleInsertLink();
                } else if (btn.command === 'insertImage') {
                  handleInsertImage();
                } else {
                  exec(btn.command, btn.value);
                }
              }}
              className="p-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              {btn.icon}
            </button>
          );
        })}
        {/* Link and Image buttons */}
        <Divider />
        <button
          type="button"
          title="Chèn liên kết"
          onMouseDown={e => { e.preventDefault(); handleInsertLink(); }}
          className="p-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          title="Chèn ảnh"
          onMouseDown={e => { e.preventDefault(); handleInsertImage(); }}
          className="p-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <Image size={16} />
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className={`
          outline-none px-6 py-5 text-gray-800 leading-relaxed
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-6 [&_h1]:mb-3
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2
          [&_h3]:text-xl  [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:leading-relaxed [&_p]:mb-3
          [&_strong]:font-bold
          [&_em]:italic
          [&_u]:underline
          [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
          [&_pre]:bg-gray-900 [&_pre]:text-green-300 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm [&_pre]:font-mono
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
          [&_li]:mb-1.5
          [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_img]:shadow-md
          [&_a]:text-indigo-600 [&_a]:underline
          [&_hr]:border-gray-200 [&_hr]:my-6
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none
        `}
        style={{ minHeight }}
      />
    </div>
  );
}
