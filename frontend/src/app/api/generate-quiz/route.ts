import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectName = 'Data Structures & Algorithms', topic = 'AVL Trees & Graph Algorithms', count = 5 } = body;

    const sampleQuestions: QuizQuestion[] = [
      {
        id: `q-${Date.now()}-1`,
        question: `In an AVL Tree, what is the maximum allowed balance factor difference between the height of the left and right subtrees of any node?`,
        options: ['0', '1', '2', 'Log(N)'],
        correctIndex: 1,
        explanation: `An AVL tree is a self-balancing binary search tree where the height difference (balance factor = height(left) - height(right)) between left and right subtrees cannot exceed 1 (-1, 0, or 1).`,
        topicTag: 'AVL Trees',
      },
      {
        id: `q-${Date.now()}-2`,
        question: `Which algorithm is best suited to find the shortest path from a single source vertex to all other vertices in a weighted graph with negative edge weights?`,
        options: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
        correctIndex: 1,
        explanation: `Bellman-Ford algorithm can handle negative edge weights (and detect negative cycles) in O(V*E) time, whereas Dijkstra's algorithm fails with negative edge weights.`,
        topicTag: 'Graph Algorithms',
      },
      {
        id: `q-${Date.now()}-3`,
        question: `What is the worst-case time complexity of QuickSort when the pivot is consistently chosen as the smallest element in an already sorted array?`,
        options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(2^N)'],
        correctIndex: 2,
        explanation: `When the pivot choice divides the array into unbalanced partitions of size 0 and N-1 repeatedly, QuickSort degrades to its worst-case O(N²) quadratic complexity.`,
        topicTag: 'Sorting Algorithms',
      },
      {
        id: `q-${Date.now()}-4`,
        question: `In an Operating System, which of the following is NOT one of the 4 Coffman conditions required for a Deadlock to occur?`,
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        correctIndex: 2,
        explanation: `The 4 Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. NO Preemption (resources cannot be forcibly confiscated), 4. Circular Wait. "Preemption Allowed" prevents deadlock.`,
        topicTag: 'Operating Systems',
      },
      {
        id: `q-${Date.now()}-5`,
        question: `What is the amortized time complexity per operation for dynamic array resizing (std::vector push_back) when geometric doubling is used?`,
        options: ['O(1)', 'O(N)', 'O(Log N)', 'O(N log N)'],
        correctIndex: 0,
        explanation: `Even though doubling array capacity takes O(N) work periodically, the total cost of N insertions is 2N - 1, giving an amortized time complexity of O(1) per push_back.`,
        topicTag: 'Array Data Structures',
      },
    ];

    return NextResponse.json({
      success: true,
      subjectName,
      topic,
      totalQuestions: sampleQuestions.length,
      questions: sampleQuestions,
    });
  } catch (err: any) {
    console.error('[Generate Quiz API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate practice quiz' },
      { status: 500 }
    );
  }
}
