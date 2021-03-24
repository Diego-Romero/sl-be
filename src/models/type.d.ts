export type AuthenticatedContextType = {
  loggedIn: boolean;
  logout: () => void;
  login: () => void;
};

export interface Friend {
  id: string;
  name: string;
  email: string;
}

export interface List {
  name: string;
  listId: string;
  userId: string;
  description?: string;
  createdAt: string;
}
export interface ListItem {
  itemId: string;
  listId: string;
  name: string;
  createdAt: string;
  description: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
}
