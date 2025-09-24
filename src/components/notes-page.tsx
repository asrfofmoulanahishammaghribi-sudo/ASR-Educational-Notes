"use client";

import { useState, useMemo, type ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { initialNotes, initialCategories, type Note, type Category } from '@/lib/data';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/app-sidebar';
import { NoteList } from '@/components/note-list';
import { NoteEditor } from '@/components/note-editor';
import { useToast } from '@/hooks/use-toast';

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { toast } = useToast();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, searchTerm]);

  const handleNewNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    toast({
      title: "Note Deleted",
      description: "The note has been successfully deleted.",
    });
  };

  const handleSaveNote = (noteToSave: Note) => {
    if (editingNote) {
      setNotes(notes.map(n => n.id === noteToSave.id ? noteToSave : n));
       toast({
        title: "Note Updated",
        description: "Your note has been successfully updated.",
      });
    } else {
      setNotes([noteToSave, ...notes]);
       toast({
        title: "Note Created",
        description: "Your new note has been successfully created.",
      });
    }
    setEditorOpen(false);
    setEditingNote(null);
  };
  
  const handleSaveCategory = (categoryToSave: Category, parentId?: string) => {
    if (parentId) {
      // It's a sub-category
      const addSubCategory = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === parentId) {
            const existingSub = c.subCategories?.find(sc => sc.id === categoryToSave.id);
            if (existingSub) {
              // Update existing sub-category
              const updatedSubCategories = c.subCategories?.map(sc => sc.id === categoryToSave.id ? categoryToSave : sc);
              return { ...c, subCategories: updatedSubCategories };
            } else {
              // Add new sub-category
              const newSubCategories = [...(c.subCategories || []), categoryToSave];
              return { ...c, subCategories: newSubCategories };
            }
          }
          if (c.subCategories) {
            return { ...c, subCategories: addSubCategory(c.subCategories) };
          }
          return c;
        });
      };
      setCategories(addSubCategory(categories));
      toast({ title: parentId ? "Sub-category Saved" : "Category Saved" });
    } else {
      // It's a top-level category
      const isNew = !categories.some(c => c.id === categoryToSave.id);
      if (isNew) {
        setCategories([...categories, categoryToSave]);
        toast({ title: "Category Created" });
      } else {
        setCategories(categories.map(c => c.id === categoryToSave.id ? categoryToSave : c));
        toast({ title: "Category Updated" });
      }
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (notes.some(n => n.categoryId === categoryId)) {
      toast({
        variant: "destructive",
        title: "Cannot delete category",
        description: "Please reassign or delete notes in this category first.",
      });
      return;
    }

    const removeCategory = (cats: Category[], id: string): Category[] => {
        return cats.filter(c => c.id !== id).map(c => {
            if (c.subCategories) {
                return { ...c, subCategories: removeCategory(c.subCategories, id) };
            }
            return c;
        });
    };

    setCategories(prev => removeCategory(prev, categoryId));
    toast({ title: "Category Deleted" });
  }
  
  const allCategories = useMemo(() => {
      const flatCategories: Category[] = [];
      const flatten = (cats: Category[]) => {
          cats.forEach(c => {
              flatCategories.push(c);
              if (c.subCategories) {
                  flatten(c.subCategories);
              }
          });
      };
      flatten(categories);
      return flatCategories;
  }, [categories]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          categories={categories}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
        />
        <SidebarInset className="flex-1 flex flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-1/2 lg:w-1/3"
              />
            </div>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Button onClick={handleNewNote} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <NoteList notes={filteredNotes} categories={allCategories} onEdit={handleEditNote} onDelete={handleDeleteNote} />
          </main>
        </SidebarInset>
      </div>

      <NoteEditor
        isOpen={isEditorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        onSave={handleSaveNote}
        categories={categories}
      />
    </SidebarProvider>
  );
}
