import { DLLNode, LRU } from "@/types/cache";

export class Cache<T> implements LRU<T> {
  capacity: number;
  head: DLLNode<T>;
  tail: DLLNode<T>;
  map: Map<string, DLLNode<T>>;
  constructor() {
    this.capacity = 20;

    this.head = Cache.createNode<T>("head", "" as T);
    this.tail = Cache.createNode<T>("tail", "" as T);
    this.head.next = this.tail;
    this.tail.prev = this.head;

    this.map = new Map();
  }

  private static createNode<T>(key: string, data: T): DLLNode<T> {
    return {
      data,
      next: null,
      prev: null,
      key,
    };
  }

  get(key: string): T | null {
    const node = this.map.get(key);
    if (!node) return null;

    // insert after head and remove linking from any place else
    if (node.prev && node.next) {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }

    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;

    return node.data;
  }

  put(key: string, value: T) {
    const node = this.map.get(key);

    if (node) {
      if (node.prev && node.next) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }

      node.next = this.head.next;
      node.prev = this.head;
      if (this.head.next) {
        this.head.next.prev = node;
      }
      this.head.next = node;
      node.data = value;
      this.map.set(key, node);
    } else {
      this.evict();

      const newNode = Cache.createNode(key, value);
      newNode.next = this.head.next;
      newNode.prev = this.head;

      if (this.head.next) {
        this.head.next.prev = newNode;
      }
      this.head.next = newNode;
      this.map.set(key, newNode);
    }
  }

  private evict() {
    if (this.capacity > this.map.size) {
      return;
    }

    const nodeToRemove = this.tail.prev;
    if (!nodeToRemove || nodeToRemove === this.head) {
      return;
    }

    if (nodeToRemove.prev) {
      nodeToRemove.prev.next = this.tail;
    }
    this.tail.prev = nodeToRemove.prev ?? this.head;

    nodeToRemove.next = null;
    nodeToRemove.prev = null;

    this.map.delete(nodeToRemove.key);
  }
}
