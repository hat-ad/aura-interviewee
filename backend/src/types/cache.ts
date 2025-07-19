export interface DLLNode<T> {
  next: DLLNode<T> | null;
  prev: DLLNode<T> | null;
  data: T;
  key: string;
}

export interface LRU<T> {
  capacity: number;
  head: DLLNode<T> | null;
  tail: DLLNode<T> | null;
  map: Map<string, DLLNode<T>>;

  get(key: string): T | null;
  put(key: string, value: T): void;
}
