import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import RichTextEditor from '@/components/RichTextEditor'

export default function JobDescriptionEditorCard({
  activeJobDescriptionId,
  title,
  onTitleChange,
  html,
  onEditorChange,
}: {
  activeJobDescriptionId: string | null
  title: string
  onTitleChange: (v: string) => void
  html: string
  onEditorChange: (next: { html: string; text: string }) => void
}) {
  return (
    <Card className="p-4">
      {activeJobDescriptionId ? (
        <div className="space-y-3">
          <Input 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)} 
            placeholder="Role title (e.g. Senior Frontend Engineer)"
            className="text-base font-medium"
          />
          <RichTextEditor valueHtml={html} onChange={onEditorChange} placeholder="Paste the job description here…" />
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-white/40">
          Select or create a job description to start editing
        </div>
      )}
    </Card>
  )
}

