import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Note, Category } from './data';

// Define User type for database operations
interface User {
  displayName: string;
  email: string;
  theme?: {
    primary: string;
    background: string;
    accent: string;
  };
}

const NOTES_COLLECTION = 'notes';
const CATEGORIES_COLLECTION = 'categories';
const USERS_COLLECTION = 'users';

// Note Functions
export async function getNotes(): Promise<Note[]> {
  const q = query(collection(db, NOTES_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Note);
}

export async function saveNote(note: Note): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, note.id);
  await setDoc(noteRef, note);
}

export async function deleteNote(noteId: string): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
}

// Category Functions
export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, CATEGORIES_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Category);
}

export async function saveCategory(category: Category): Promise<void> {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, category.id);
  await setDoc(categoryRef, category, { merge: true });
}

export async function saveAllCategories(categories: Category[]): Promise<void> {
  const batch = writeBatch(db);
  categories.forEach(category => {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, category.id);
    batch.set(categoryRef, category);
  });
  await batch.commit();
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  await deleteDoc(categoryRef);
}

// User Functions
export async function saveUser(user: User): Promise<void> {
  // Use email as the document ID for simplicity
  const userRef = doc(db, USERS_COLLECTION, user.email);
  await setDoc(userRef, user, { merge: true });
}

export async function getUser(email: string): Promise<User | null> {
  const userRef = doc(db, USERS_COLLECTION, email);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
}
