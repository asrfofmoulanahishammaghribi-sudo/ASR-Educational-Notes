"use client";

import { useState, useMemo, type ChangeEvent, useEffect } from 'react';
import { Plus, LogOut, UserPlus, User } from 'lucide-react';
import Link from 'next/link';
import { initialNotes, initialCategories, type Note, type Category } from '@/lib/data';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/app-sidebar';
import { NoteList } from '@/components/note-list';
import { NoteEditor } from '@/components/note-editor';
import { useToast } from '@/hooks/use-toast';
import { 
  getNotes, 
  saveNote as saveNoteToDb, 
  deleteNote as deleteNoteFromDb,
  getCategories,
  saveAllCategories,
  deleteCategory as deleteCategoryFromDb,
} from '@/lib/firebase-services';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';


export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    async function loadData() {
      try {
        const [notesFromDb, categoriesFromDb] = await Promise.all([getNotes(), getCategories()]);
        setNotes(notesFromDb);
        // temp logic to seed categories if db is empty
        if (categoriesFromDb.length === 0 && initialCategories.length > 0) {
            setCategories(initialCategories);
            await saveAllCategories(initialCategories);
        } else {
            setCategories(categoriesFromDb);
        }
      } catch (error) {
        console.error("Error loading data from Firestore:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);

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
  
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteFromDb(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({
        title: "Note Deleted",
        description: "The note has been successfully deleted.",
      });
    } catch(error) {
       console.error("Error deleting note:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not delete note." });
    }
  };

  const handleSaveNote = async (noteToSave: Note) => {
    const isNewNote = !editingNote;
    try {
        await saveNoteToDb(noteToSave);
        if (isNewNote) {
            setNotes([noteToSave, ...notes]);
        } else {
            setNotes(notes.map(n => n.id === noteToSave.id ? noteToSave : n));
        }
        toast({
            title: isNewNote ? "Note Created" : "Note Updated",
            description: `Your note has been successfully ${isNewNote ? 'created' : 'updated'}.`,
        });
        setEditorOpen(false);
        setEditingNote(null);
    } catch(error) {
        console.error("Error saving note:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save note." });
    }
  };
  
  const handleSaveCategory = async (categoryToSave: Category, parentId?: string) => {
    let updatedCategories = [...categories];
    if (parentId) {
      const addSubCategory = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === parentId) {
            const existingSub = c.subCategories?.find(sc => sc.id === categoryToSave.id);
            if (existingSub) {
              const updatedSubCategories = c.subCategories?.map(sc => sc.id === categoryToSave.id ? categoryToSave : sc);
              return { ...c, subCategories: updatedSubCategories };
            } else {
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
      updatedCategories = addSubCategory(updatedCategories);
    } else {
      const isNew = !categories.some(c => c.id === categoryToSave.id);
      if (isNew) {
        updatedCategories.push(categoryToSave);
      } else {
        updatedCategories = categories.map(c => c.id === categoryToSave.id ? categoryToSave : c);
      }
    }

    try {
      await saveAllCategories(updatedCategories);
      setCategories(updatedCategories);
      toast({ title: "Category Saved" });
    } catch (error) {
      console.error("Error saving categories:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save categories." });
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const notesExist = notes.some(n => {
        if (n.categoryId === categoryId) return true;
        const parentCategory = categories.find(c => c.subCategories?.some(sc => sc.id === categoryId));
        return parentCategory?.subCategories?.some(sc => sc.id === n.categoryId);
    });

    if (notesExist) {
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

    const updatedCategories = removeCategory(categories, categoryId);
    try {
      await saveAllCategories(updatedCategories); // We resave the whole tree to remove one
      setCategories(updatedCategories);
      toast({ title: "Category Deleted" });
    } catch (error) {
       console.error("Error deleting category:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not delete category." });
    }
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
             {user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{(user.displayName || user.email)?.[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem disabled>
                      <span className="font-medium truncate">{user.displayName || user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/signup')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Create User</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleNewNote} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6">
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <h2 className="text-2xl font-semibold">Loading your notes...</h2>
                 </div>
            ) : (
                <NoteList notes={filteredNotes} categories={allCategories} onEdit={handleEditNote} onDelete={handleDeleteNote} />
            )}
          </main>
        </SidebarInset>
      

        <NoteEditor
          isOpen={isEditorOpen}
          onOpenChange={setEditorOpen}
          note={editingNote}
          onSave={handleSaveNote}
          categories={categories}
        />
      </div>
    </SidebarProvider>
  );
}
