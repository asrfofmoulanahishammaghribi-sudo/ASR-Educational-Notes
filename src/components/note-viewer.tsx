
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Note, Category } from "@/lib/data";
import { Paperclip, Download } from "lucide-react";
import { FileIcon } from "./file-icon";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";


interface NoteViewerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  note: Note | null;
  category?: Category | null;
}

export function NoteViewer({ isOpen, onOpenChange, note, category }: NoteViewerProps) {
  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">{note.title}</DialogTitle>
          {category && (
            <div className="flex items-center gap-2 pt-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
              <span className="text-sm text-muted-foreground">{category.name}</span>
            </div>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <div 
            className="prose dark:prose-invert max-w-none ql-editor note-content-color"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </ScrollArea>
        <div className="mt-4 flex flex-col gap-4 border-t pt-4">
            {note.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary"  style={{
                            backgroundColor: category?.color ? `${category.color}20` : undefined,
                            color: category?.color
                        }}>{tag}</Badge>
                    ))}
                </div>
            )}
            {note.attachments.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</h4>
                    <div className="space-y-2">
                        {note.attachments.map(file => (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md text-sm">
                                <FileIcon type={file.type} />
                                <span className="flex-1 truncate">{file.name}</span>
                                <span className="text-muted-foreground text-xs">{file.size}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
