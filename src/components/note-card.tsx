
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Note, Category } from '@/lib/data';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: Note;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  isLoggedIn: boolean;
}

export function NoteCard({ note, category, onEdit, onDelete, onView, isLoggedIn }: NoteCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="flex-grow cursor-pointer" onClick={onView}>
        <CardHeader>
            <CardTitle className="text-lg font-bold font-headline">{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
        </CardContent>
      </div>
      <CardFooter className="flex flex-col items-start gap-4 pt-4">
        <div className="flex justify-between items-end w-full">
            <div className="flex flex-col gap-2 items-start">
                 {category && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-xs text-muted-foreground">{category.name}</span>
                    </div>
                 )}
                 <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" style={{
                        backgroundColor: category?.color ? `${category.color}20` : undefined,
                        color: category?.color
                        }}>{tag}</Badge>
                    ))}
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </div>
            </div>
            {isLoggedIn && (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onClick={onEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDelete} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
