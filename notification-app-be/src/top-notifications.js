/**
 * MaxHeap — Priority Queue implementation for Top-K notification ranking.
 *
 * A max heap keeps the highest-priority element at the root.
 * We use it here because extracting the top element is O(log n),
 * and inserting is also O(log n), making it ideal for streaming
 * or large datasets where we want the Top-K items efficiently.
 */
class MaxHeap {
  constructor(compareFn) {
    this.heap = [];
    this.compare = compareFn;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] ?? null;
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

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) > 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[largest]) > 0) {
        largest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[largest]) > 0) {
        largest = right;
      }
      if (largest !== index) {
        [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
        index = largest;
      } else {
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Priority Weights
// ---------------------------------------------------------------------------
const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Compute a composite priority score.
 *
 * Formula:  score = typeWeight * 1e12  +  timestamp
 *
 * - typeWeight (Placement=3, Result=2, Event=1) is the dominant factor.
 *   Multiplying by 1e12 ensures that ANY Placement notification always
 *   outranks ANY Result, regardless of recency.
 * - Within the same type, the Unix timestamp (ms) acts as a tiebreaker —
 *   newer notifications rank higher.
 */
function computeScore(notification) {
  const typeWeight = TYPE_WEIGHT[notification.type] ?? 0;
  const timestamp = new Date(notification.createdAt).getTime();
  return typeWeight * 1e12 + timestamp;
}

/**
 * Compare two notifications by their priority score.
 * Returns positive if a > b (a has higher priority).
 */
function compareNotifications(a, b) {
  return a._score - b._score;
}

// ---------------------------------------------------------------------------
// Top-K extraction using MaxHeap
// ---------------------------------------------------------------------------

/**
 * Given an array of notifications, return the top K by priority.
 *
 * Time Complexity:
 *   - Building the heap:  O(n log n)  where n = total notifications
 *   - Extracting top K:   O(k log n)
 *   - Total:              O(n log n)
 *
 * Space Complexity: O(n)
 */
function getTopKNotifications(notifications, k = 10) {
  const heap = new MaxHeap(compareNotifications);

  // Insert all notifications into the max heap
  for (const n of notifications) {
    const scored = { ...n, _score: computeScore(n) };
    heap.push(scored);
  }

  // Extract top K
  const topK = [];
  for (let i = 0; i < k && heap.size() > 0; i++) {
    const item = heap.pop();
    // Remove internal _score before returning
    const { _score, ...notification } = item;
    topK.push({ ...notification, rank: i + 1, priorityScore: _score });
  }

  return topK;
}

// ---------------------------------------------------------------------------
// Sample Notifications (used when API is not available)
// ---------------------------------------------------------------------------
const SAMPLE_NOTIFICATIONS = [
  { id: "n1",  title: "TCS Placement Drive",        message: "TCS on-campus recruitment July 5th. CSE, ECE, EEE eligible. Min CGPA: 7.0", type: "Placement", priority: "high",   read: false, createdAt: "2026-06-18T09:00:00.000Z" },
  { id: "n2",  title: "Semester Results Published",  message: "B.Tech 3rd semester results are out. Check the portal.",                   type: "Result",    priority: "normal", read: true,  createdAt: "2026-06-17T14:30:00.000Z" },
  { id: "n3",  title: "Annual Tech Fest",            message: "Register for Innovision 2026! Hackathon, coding contests.",                type: "Event",     priority: "normal", read: false, createdAt: "2026-06-16T10:00:00.000Z" },
  { id: "n4",  title: "Infosys InfyTQ Results",      message: "InfyTQ certification results out. Passed students shortlisted.",           type: "Placement", priority: "high",   read: false, createdAt: "2026-06-15T11:00:00.000Z" },
  { id: "n5",  title: "Mid-Sem Exam Schedule",       message: "Mid-semester exams for all branches from July 10th.",                      type: "Result",    priority: "high",   read: false, createdAt: "2026-06-14T08:00:00.000Z" },
  { id: "n6",  title: "Campus Cultural Night",       message: "Annual cultural night on June 28th. All students welcome!",                type: "Event",     priority: "normal", read: false, createdAt: "2026-06-13T16:00:00.000Z" },
  { id: "n7",  title: "Wipro Hiring Drive",          message: "Wipro NLTH registrations open. Apply before June 30th.",                   type: "Placement", priority: "high",   read: false, createdAt: "2026-06-12T09:30:00.000Z" },
  { id: "n8",  title: "Lab Exam Results",            message: "Physics and Chemistry lab exam results published.",                        type: "Result",    priority: "normal", read: true,  createdAt: "2026-06-11T13:00:00.000Z" },
  { id: "n9",  title: "Sports Day Registration",     message: "Inter-department sports day. Register by June 20th.",                      type: "Event",     priority: "normal", read: false, createdAt: "2026-06-10T10:00:00.000Z" },
  { id: "n10", title: "Cognizant GenC Next",         message: "Cognizant GenC Next drive on June 25th. B.Tech CSE only.",                 type: "Placement", priority: "high",   read: false, createdAt: "2026-06-09T08:00:00.000Z" },
  { id: "n11", title: "Supplementary Exam Notice",   message: "Supplementary exams for failed subjects. Apply by June 22nd.",             type: "Result",    priority: "high",   read: false, createdAt: "2026-06-08T09:00:00.000Z" },
  { id: "n12", title: "Guest Lecture — AI in 2026",  message: "Guest lecture by Dr. Ramesh on AI trends. Seminar Hall, June 19th.",        type: "Event",     priority: "normal", read: false, createdAt: "2026-06-07T11:00:00.000Z" },
  { id: "n13", title: "Amazon SDE Internship",       message: "Amazon SDE internship for pre-final year. CGPA > 8.0 required.",           type: "Placement", priority: "high",   read: false, createdAt: "2026-06-18T11:30:00.000Z" },
  { id: "n14", title: "GATE Mock Test Results",      message: "GATE mock test scores are available. Check the placement portal.",          type: "Result",    priority: "normal", read: false, createdAt: "2026-06-17T16:00:00.000Z" },
  { id: "n15", title: "NSS Blood Donation Camp",     message: "NSS blood donation camp on June 21st. Volunteers needed.",                  type: "Event",     priority: "normal", read: false, createdAt: "2026-06-15T14:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// Fetch from API (with fallback to sample data)
// ---------------------------------------------------------------------------
async function fetchNotificationsFromAPI(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.notifications ?? data;
  } catch (error) {
    console.log(`\n⚠️  Could not reach API at ${apiUrl}`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Using sample notification data instead.\n`);
    return SAMPLE_NOTIFICATIONS;
  }
}

// ---------------------------------------------------------------------------
// Pretty Print
// ---------------------------------------------------------------------------
function printResults(topNotifications) {
  console.log("=".repeat(90));
  console.log("  🔔 TOP 10 PRIORITY NOTIFICATIONS (Max Heap)");
  console.log("=".repeat(90));
  console.log();

  console.log(
    "Rank".padEnd(6) +
    "Type".padEnd(12) +
    "Title".padEnd(35) +
    "Date".padEnd(22) +
    "Score"
  );
  console.log("-".repeat(90));

  for (const n of topNotifications) {
    const date = new Date(n.createdAt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const typeIcon =
      n.type === "Placement" ? "💼" :
      n.type === "Result"    ? "📊" :
                               "🎉";

    console.log(
      `#${n.rank}`.padEnd(6) +
      `${typeIcon} ${n.type}`.padEnd(12) +
      n.title.substring(0, 33).padEnd(35) +
      date.padEnd(22) +
      n.priorityScore.toLocaleString()
    );
  }

  console.log();
  console.log("-".repeat(90));
  console.log("Priority Formula:  score = typeWeight × 10¹² + timestamp(ms)");
  console.log("Weights:           Placement = 3  |  Result = 2  |  Event = 1");
  console.log("Data Structure:    Max Heap (Binary Heap)");
  console.log("Time Complexity:   O(n log n) build  +  O(k log n) extract  =  O(n log n)");
  console.log("=".repeat(90));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Default API URL — change this to point at your running backend
  const API_URL = process.argv[2] || "http://localhost:3001/api/notifications";

  console.log("\n📡 Fetching notifications from:", API_URL);

  const notifications = await fetchNotificationsFromAPI(API_URL);
  console.log(`📦 Received ${notifications.length} notifications\n`);

  const top10 = getTopKNotifications(notifications, 10);
  printResults(top10);
}

main().catch(console.error);
