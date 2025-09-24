"use client";
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/color-picker';
import { Category, CATEGORY_COLORS } from '@/lib/data';
import { Plus, Trash2, Edit, MoreVertical, ChevronRight, FolderPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';


interface AppSidebarProps {
  categories: Category[];
  onSaveCategory: (category: Category, parentId?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  isLoggedIn: boolean;
}

export function AppSidebar({ categories, onSaveCategory, onDeleteCategory, isLoggedIn }: AppSidebarProps) {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(undefined);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const handleOpenCategoryModal = (category?: Category, parentId?: string) => {
    if (!isLoggedIn) return;
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color);
      setParentCategoryId(parentId);
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor(parentId ? categories.find(c => c.id === parentId)?.color || CATEGORY_COLORS[0] : CATEGORY_COLORS[0]);
      setParentCategoryId(parentId);
    }
    setCategoryModalOpen(true);
  };

  const handleSave = () => {
    if (!categoryName) return;
    const categoryData: Category = editingCategory
      ? { ...editingCategory, name: categoryName, color: categoryColor }
      : { id: `cat-${Date.now()}`, name: categoryName, color: categoryColor, subCategories: [] };

    onSaveCategory(categoryData, parentCategoryId);
    setCategoryModalOpen(false);
  };
  
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const renderCategory = (category: Category, isSubcategory = false) => (
    <Collapsible open={openCategories[category.id]} onOpenChange={() => toggleCategory(category.id)} key={category.id}>
      <SidebarMenuItem className={cn(isSubcategory && "ml-4")}>
        <div className="flex items-center w-full">
          {!!category.subCategories?.length && (
            <CollapsibleTrigger asChild>
              <button className="p-1 rounded-md hover:bg-accent">
                <ChevronRight className={cn("w-4 h-4 transition-transform", openCategories[category.id] && "rotate-90")} />
              </button>
            </CollapsibleTrigger>
          )}
          <SidebarMenuButton tooltip={category.name} isActive={false} className={cn(!category.subCategories?.length && "ml-6")}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
            <span>{category.name}</span>
          </SidebarMenuButton>
        </div>
        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOpenCategoryModal(category)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
               {!isSubcategory && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpenCategoryModal(undefined, category.id)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    <span>Add Sub-category</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteCategory(category.id)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
      {category.subCategories && category.subCategories.length > 0 && (
        <CollapsibleContent>
           <SidebarMenu>
            {category.subCategories.map(subCat => renderCategory(subCat, true))}
           </SidebarMenu>
        </CollapsibleContent>
      )}
    </Collapsible>
  );

  return (
    <>
      <Sidebar>
        <SidebarHeader className='p-4'>
          <div className="flex items-center">
            <h1 className="text-xl font-headline font-bold">ASR Notes</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Categories</SidebarGroupLabel>
            <SidebarMenu>
              {categories.map(category => renderCategory(category))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        {isLoggedIn && (
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleOpenCategoryModal()}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </SidebarFooter>
        )}
      </Sidebar>

      <Dialog open={isCategoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : (parentCategoryId ? 'New Sub-category' : 'New Category')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker
                colors={CATEGORY_COLORS}
                selectedColor={categoryColor}
                onSelectColor={setCategoryColor}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
