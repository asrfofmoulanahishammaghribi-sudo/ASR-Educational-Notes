"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Paperclip, FileText, Download, Wand2, Loader2, Bold, Italic, Underline, List, ListOrdered, Code, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Note, Category, Attachment } from "@/lib/data";
import { suggestTags, type SuggestTagsOutput } from "@/ai/flows/intelligent-tagging";
import { FileIcon } from "./file-icon";

interface NoteEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  note: Note | null;
  onSave: (note: Note) => void;
  categories: Category[];
}

export function NoteEditor({ isOpen, onOpenChange, note, onSave, categories }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestTagsOutput | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategoryId(note.categoryId);
      setTags(note.tags);
      setAttachments(note.attachments);
    } else {
      setTitle("");
      setContent("");
      setCategoryId(categories[0]?.id || "");
      setTags([]);
      setAttachments([]);
    }
    setSuggestions(null);
  }, [note, isOpen, categories]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : (file.name.endsWith('.pdf') ? 'pdf' : (file.name.endsWith('.docx') ? 'word' : (file.name.endsWith('.xlsx') ? 'excel' : 'other'))),
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)}KB`
      } as Attachment));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSave = () => {
    if (!title || !content || !categoryId) return;
    const noteToSave: Note = {
      id: note?.id || `note-${Date.now()}`,
      title,
      content,
      categoryId,
      tags,
      attachments,
      createdAt: note?.createdAt || new Date().toISOString(),
    };
    onSave(noteToSave);
  };
  
  const handleSuggestTags = async () => {
    if(!content) return;
    setIsSuggesting(true);
    setSuggestions(null);
    try {
        const result = await suggestTags({ noteContent: content });
        setSuggestions(result);
    } catch (error) {
        console.error("Failed to get suggestions:", error);
    } finally {
        setIsSuggesting(false);
    }
  };

  const addSuggestedTag = (tag: string) => {
      if (!tags.includes(tag)) {
          setTags(prev => [...prev, tag]);
      }
  }

  const applySuggestedCategory = (header: string) => {
    const allCategories: Category[] = [];
    const flatten = (cats: Category[]) => {
      cats.forEach(c => {
        allCategories.push(c);
        if (c.subCategories) flatten(c.subCategories);
      });
    };
    flatten(categories);
    const existingCategory = allCategories.find(c => c.name.toLowerCase() === header.toLowerCase());
    if (existingCategory) {
        setCategoryId(existingCategory.id);
    }
  }
  
  const renderCategoryOptions = (cats: Category[], isSub = false) => {
    return cats.map(cat => (
        <React.Fragment key={cat.id}>
            <SelectItem value={cat.id} className={isSub ? 'pl-8' : ''}>{cat.name}</SelectItem>
            {cat.subCategories && renderCategoryOptions(cat.subCategories, true)}
        </React.Fragment>
    ));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>{note ? "Edit Note" : "New Note"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6 py-4">
            <Input
                placeholder="Note Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-lg font-bold"
            />
            
            <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {renderCategoryOptions(categories)}
                </SelectContent>
            </Select>

            <div>
              <Textarea
                placeholder="Start writing your note here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="min-h-[200px] text-base"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Dummy formatting buttons */}
                  <Button variant="ghost" size="icon" disabled><Bold/></Button>
                  <Button variant="ghost" size="icon" disabled><Italic/></Button>
                  <Button variant="ghost" size="icon" disabled><Underline/></Button>
                  <Button variant="ghost" size="icon" disabled><List/></Button>
                  <Button variant="ghost" size="icon" disabled><ListOrdered/></Button>
                  <Button variant="ghost" size="icon" disabled><Code/></Button>
                  <Button variant="ghost" size="icon" disabled><Quote/></Button>
                </div>
                <Button onClick={handleSuggestTags} variant="outline" size="sm" disabled={isSuggesting || !content}>
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                  Suggest
                </Button>
              </div>
            </div>
            
            {isSuggesting && <div className="text-center p-4">Loading suggestions...</div>}
            {suggestions && (
                <div className="space-y-2 p-3 bg-secondary/50 rounded-md">
                    <h4 className="font-semibold text-sm">AI Suggestions</h4>
                    {suggestions.suggestedTags.length > 0 && <div className="flex flex-wrap gap-2">
                        {suggestions.suggestedTags.map(tag => (
                            <Badge key={tag} onClick={() => addSuggestedTag(tag)} className="cursor-pointer" variant="outline">{tag}</Badge>
                        ))}
                    </div>}
                     {suggestions.suggestedHeaders.length > 0 && <div className="flex flex-wrap gap-2">
                        {suggestions.suggestedHeaders.map(header => (
                            <Badge key={header} onClick={() => applySuggestedCategory(header)} className="cursor-pointer" variant="default">{header}</Badge>
                        ))}
                    </div>}
                </div>
            )}
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-10">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
                <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto p-0 m-0"
                />
              </div>
            </div>
            
            <div>
              <Label>Attachments</Label>
              <div className="mt-2 space-y-2">
                 {attachments.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md text-sm">
                        <FileIcon type={file.type} />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-muted-foreground text-xs">{file.size}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeAttachment(file.id)}><X className="h-4 w-4"/></Button>
                    </div>
                 ))}
              </div>
              <Button variant="outline" className="mt-2 w-full" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="mr-2 h-4 w-4" />
                Add Attachment
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </SheetClose>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
