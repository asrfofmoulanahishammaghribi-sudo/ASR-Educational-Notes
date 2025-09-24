export const CATEGORY_COLORS = [
  '#8E44AD',
  '#2980B9',
  '#27AE60',
  '#F1C40F',
  '#E67E22',
  '#E74C3C',
  '#95A5A6',
];

export interface Category {
  id: string;
  name: string;
  color: string;
  subCategories?: Category[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  url: string;
  size: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
}

export const initialCategories: Category[] = [
  { 
    id: 'cat-1', 
    name: 'Software Engineering', 
    color: '#2980B9',
    subCategories: [
      { id: 'sub-cat-1', name: 'Frontend', color: '#2980B9' },
      { id: 'sub-cat-2', name: 'Backend', color: '#2980B9' },
    ]
  },
  { id: 'cat-2', name: 'Project Management', color: '#27AE60' },
  { id: 'cat-3', name: 'Personal Development', color: '#8E44AD' },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Understanding React Hooks',
    content: 'React Hooks are functions that let you "hook into" React state and lifecycle features from function components. `useState` is for state, `useEffect` for side effects. They must be called at the top level of your components.',
    categoryId: 'sub-cat-1',
    tags: ['react', 'frontend', 'javascript'],
    attachments: [
      { id: 'att-1', name: 'react-cheatsheet.pdf', type: 'pdf', url: '#', size: '1.2MB' },
    ],
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: 'note-2',
    title: 'Agile Methodology Basics',
    content: 'Agile is an iterative approach to project management and software development that helps teams deliver value to their customers faster. Key principles include customer collaboration, responding to change, and delivering working software frequently.',
    categoryId: 'cat-2',
    tags: ['agile', 'scrum', 'methodology'],
    attachments: [],
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: 'note-3',
    title: 'Weekly Reading List',
    content: '1. "Atomic Habits" by James Clear\n2. "Thinking, Fast and Slow" by Daniel Kahneman\n3. Explore new features in Next.js 14.',
    categoryId: 'cat-3',
    tags: ['books', 'reading', 'habits'],
    attachments: [
      { id: 'att-2', name: 'nextjs-14-features.docx', type: 'word', url: '#', size: '345KB' },
      { id: 'att-3', name: 'reading-progress.xlsx', type: 'excel', url: '#', size: '128KB' },
    ],
    createdAt: '2023-10-24T09:00:00Z',
  },
  {
    id: 'note-4',
    title: 'Database Design Principles',
    content: 'Normalization is the process of organizing columns and tables in a relational database to minimize data redundancy. The first three normal forms (1NF, 2NF, 3NF) are the most common.',
    categoryId: 'sub-cat-2',
    tags: ['database', 'sql', 'normalization'],
    attachments: [],
    createdAt: '2023-10-23T11:00:00Z',
  }
];
