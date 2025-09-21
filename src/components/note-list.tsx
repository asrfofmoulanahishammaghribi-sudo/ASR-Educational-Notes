import { Note, Category } from '@/lib/data';
import { NoteCard } from './note-card';

interface NoteListProps {
  notes: Note[];
  categories: Category[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteList({ notes, categories, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <h2 className="text-2xl font-semibold">No notes found</h2>
        <p>Create a new note or try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in-50">
      {notes.map(note => (
        <NoteCard 
          key={note.id}
          note={note}
          category={categories.find(c => c.id === note.categoryId)}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </div>
  );
}
