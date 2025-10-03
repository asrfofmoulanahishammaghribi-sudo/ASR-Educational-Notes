
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
import { NoteViewer } from '@/components/note-viewer';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isViewerOpen, setViewerOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isLoggedIn = !!user;
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
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
  
  const getCategoryAndSubCategoryIds = (categories: Category[], categoryId: string): string[] => {
    let ids: string[] = [];
    const findCategory = (cats: Category[], id: string) => {
        for (const cat of cats) {
            if (cat.id === id) {
                ids.push(cat.id);
                if (cat.subCategories) {
                    cat.subCategories.forEach(subCat => {
                        ids.push(subCat.id);
                        if (subCat.subCategories) {
                            getCategoryAndSubCategoryIds(subCat.subCategories, subCat.id).forEach(subId => ids.push(subId));
                        }
                    });
                }
                return cat;
            }
            if (cat.subCategories) {
                const found = findCategory(cat.subCategories, id);
                if (found) return found;
            }
        }
        return null;
    };

    findCategory(categories, categoryId);
    return [...new Set(ids)]; // Return unique IDs
  };

  const filteredNotes = useMemo(() => {
    let notesToFilter = notes;
    
    if (selectedCategoryId) {
      const categoryIdsToFilter = getCategoryAndSubCategoryIds(categories, selectedCategoryId);
      notesToFilter = notesToFilter.filter(note => categoryIdsToFilter.includes(note.categoryId));
    }
    
    if (!searchTerm) return notesToFilter;

    return notesToFilter.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, searchTerm, selectedCategoryId, categories]);

  const handleNewNote = () => {
    if (!isLoggedIn) return;
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    if (!isLoggedIn) return;
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setViewerOpen(true);
  }
  
  const handleDeleteNote = async (noteId: string) => {
    if (!isLoggedIn) return;
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
    if (!isLoggedIn) return;
    const isNewNote = !noteToSave.id || !notes.some(n => n.id === noteToSave.id);
    const finalNote = { ...noteToSave, id: noteToSave.id || `note-${Date.now()}` };

    try {
        await saveNoteToDb(finalNote);
        if (isNewNote) {
            setNotes([finalNote, ...notes]);
        } else {
            setNotes(notes.map(n => n.id === finalNote.id ? finalNote : n));
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
    if (!isLoggedIn) return;

    let updatedCategories = [...categories];
    
    const isExisting = (cats: Category[], id: string): boolean => {
        return cats.some(c => c.id === id || (c.subCategories && isExisting(c.subCategories, id)));
    }

    const recursivelyUpdate = (cats: Category[]): Category[] => {
      return cats.map(c => {
        if (c.id === categoryToSave.id) {
            return { ...categoryToSave, subCategories: c.subCategories || [] };
        }
        if (c.id === parentId) {
            // New subcategory, add it
            const newSubCategories = [...(c.subCategories || []), categoryToSave];
            return { ...c, subCategories: newSubCategories };
        }
        if (c.subCategories) {
            return { ...c, subCategories: recursivelyUpdate(c.subCategories) };
        }
        return c;
      });
    };

    if (isExisting(updatedCategories, categoryToSave.id)) {
        // This is an update
        updatedCategories = recursivelyUpdate(updatedCategories);
    } else if (parentId) {
        // This is a new subcategory
        updatedCategories = recursivelyUpdate(updatedCategories);
    } else {
        // This is a new top-level category
        updatedCategories = [...updatedCategories, categoryToSave];
    }
  
    try {
      await saveAllCategories(updatedCategories);
      setCategories(updatedCategories);
      toast({ title: "Category Saved" });
    } catch (error) {
      console.error("Error saving categories:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save categories." });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!isLoggedIn) return;

    const getCategoryIdsToDelete = (cats: Category[], id: string): string[] => {
        let ids: string[] = [];
        const categoryToDelete = cats.find(c => c.id === id);
        if (categoryToDelete) {
            ids.push(categoryToDelete.id);
            if (categoryToDelete.subCategories) {
                categoryToDelete.subCategories.forEach(sub => {
                    ids = [...ids, ...getCategoryIdsToDelete([sub], sub.id)];
                });
            }
        } else {
            for (const cat of cats) {
                if (cat.subCategories) {
                    const subIds = getCategoryIdsToDelete(cat.subCategories, id);
                    if (subIds.length > 0) {
                        ids = [...ids, ...subIds];
                        break;
                    }
                }
            }
        }
        return ids;
    };
    
    const idsToDelete = getCategoryIdsToDelete(categories, categoryId);

    const notesExist = notes.some(n => idsToDelete.includes(n.categoryId));

    if (notesExist) {
      toast({
        variant: "destructive",
        title: "Cannot delete category",
        description: "Please reassign or delete notes in this category or its subcategories first.",
      });
      return;
    }

    const removeCategoryRecursively = (cats: Category[], id: string): Category[] => {
        return cats.filter(c => c.id !== id).map(c => {
            if (c.subCategories) {
                return { ...c, subCategories: removeCategoryRecursively(c.subCategories, id) };
            }
            return c;
        });
    };

    const updatedCategories = removeCategoryRecursively(categories, categoryId);
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

  const allCategoryIds = useMemo(() => allCategories.map(c => c.id), [allCategories]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          categories={categories}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoggedIn={isLoggedIn}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          allCategoryIds={allCategoryIds}
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
                <NoteList 
                  notes={filteredNotes} 
                  categories={allCategories} 
                  onEdit={handleEditNote} 
                  onDelete={handleDeleteNote}
                  onView={handleViewNote}
                  isLoggedIn={isLoggedIn}
                />
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

        <NoteViewer
          isOpen={isViewerOpen}
          onOpenChange={setViewerOpen}
          note={viewingNote}
          category={allCategories.find(c => c.id === viewingNote?.categoryId)}
        />
      </div>
    </SidebarProvider>
  );
}
