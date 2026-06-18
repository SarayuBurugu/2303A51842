/**
 * MaxHeap — Priority Queue for Top-K notification ranking.
 * Used by the Priority Notifications page (Stage 6 logic).
 */

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function computeScore(notification) {
  const weight = TYPE_WEIGHT[notification.type] ?? 0;
  const timestamp = new Date(notification.createdAt).getTime();
  return weight * 1e12 + timestamp;
}

export class MaxHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  push(value) {
    this.heap.push(value);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i]._score > this.heap[parent]._score) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const len = this.heap.length;
    while (true) {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < len && this.heap[l]._score > this.heap[largest]._score) largest = l;
      if (r < len && this.heap[r]._score > this.heap[largest]._score) largest = r;
      if (largest !== i) {
        [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
        i = largest;
      } else break;
    }
  }
}

export function getTopK(notifications, k = 10) {
  const heap = new MaxHeap();
  for (const n of notifications) {
    heap.push({ ...n, _score: computeScore(n) });
  }
  const result = [];
  for (let i = 0; i < k && heap.size() > 0; i++) {
    const { _score, ...rest } = heap.pop();
    result.push({ ...rest, priorityScore: _score, rank: i + 1 });
  }
  return result;
}
