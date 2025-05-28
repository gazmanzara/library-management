export interface Author {
  id: number;
  name: string;
  biography: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
export interface Book {
  id: number;
  title: string;
  author: Author;
  publicationYear: number;
  description: string;
  categories: Category[];
  imgUrl: string;
  isbn: string;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

export interface BorrowedBook {
  id: number;
  book: Book;
  member: Member;
  dueDate: string;
}

export interface PopularBook {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
}

export interface TopBorrower {
  id: number;
  name: string;
  borrowCount: number;
  currentBorrows: number;
}

export interface AvailableBook {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
}

export interface AvailableMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
