import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Props = {
  valueHtml: string
  onChange: (next: { html: string; text: string }) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ valueHtml, onChange, placeholder, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Paste the job description…' }),
    ],
    content: valueHtml,
    onUpdate: ({ editor }) => {
      onChange({ html: editor.getHTML(), text: editor.getText() })
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[240px] px-4 py-3 text-sm leading-6',
      },
    },
  })

  return (
    <div className={cn('rounded-xl border border-white/10 bg-[#0d1321] overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-2 py-2 bg-[#0a0f1a]">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={cn('h-8 px-2.5', editor?.isActive('bold') ? 'bg-white/10' : '')}
        >
          Bold
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={cn('h-8 px-2.5', editor?.isActive('italic') ? 'bg-white/10' : '')}
        >
          Italic
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
          className={cn('h-8 px-2.5', editor?.isActive('bulletList') ? 'bg-white/10' : '')}
        >
          • List
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
          className={cn('h-8 px-2.5', editor?.isActive('orderedList') ? 'bg-white/10' : '')}
        >
          1. List
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

