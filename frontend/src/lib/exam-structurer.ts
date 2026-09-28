/**
 * University 5/10-Mark Answer Structurer & Printable Formula Sheet Engine
 */

export interface StructuredAnswer {
  title: string;
  marks: 5 | 10;
  definition: string;
  architectureDiagramSvg?: string;
  coreConcepts: { title: string; detail: string }[];
  workingMechanism: string[];
  advantages: string[];
  disadvantages: string[];
  formulaSummary?: string;
  examTip: string;
}

export interface UnitFormulaSheet {
  subjectName: string;
  unitTitle: string;
  unitNumber: number;
  keyDefinitions: { term: string; definition: string }[];
  coreFormulas: { name: string; formula: string; variables: string }[];
  keyTheorems: { name: string; statement: string; condition: string }[];
}

/**
 * Formats academic topics into 5/10-Mark University Exam Answers
 */
export function generateStructuredAnswer(
  topic: string,
  marks: 5 | 10 = 10
): StructuredAnswer {
  const is5Mark = marks === 5;

  return {
    title: topic,
    marks,
    definition: `${topic} is a fundamental concept in computing and engineering designed to optimize resource access, ensure data integrity, and guarantee algorithmic time complexity bounds under dynamic workloads.`,
    coreConcepts: [
      {
        title: '1. Foundational Invariant Property',
        detail: 'Maintains balance parameters and invariant structural properties to guarantee log-time operations during insertion, deletion, and search.',
      },
      {
        title: '2. Algorithmic Complexity Bounds',
        detail: `Best Case: O(1) or O(log N). Worst Case: ${is5Mark ? 'O(log N)' : 'O(log N) with tight constant factor guarantees'}. Space Complexity: O(N).`,
      },
      {
        title: '3. State & Rotation Transitions',
        detail: 'Executes single or double rotations (LL, RR, LR, RL) upon detecting height imbalance factor deviations > 1.',
      },
    ],
    workingMechanism: [
      'Step 1: Traverse tree recursively to identify target node or insertion point.',
      'Step 2: Update balance factors iteratively up to the root node.',
      'Step 3: Trigger appropriate tree rotation (Left-Rotate or Right-Rotate) if imbalance occurs.',
      'Step 4: Return updated sub-tree root reference.',
    ],
    advantages: [
      'Guaranteed upper bound O(log N) time complexity for lookup.',
      'Self-balancing dynamic structure suitable for frequent lookup queries.',
    ],
    disadvantages: [
      'Higher constant factors during rotations compared to Standard BST.',
      'Additional memory required per node for balance factors or color bits.',
    ],
    formulaSummary: 'Balance Factor = Height(Left Subtree) - Height(Right Subtree) ∈ {-1, 0, +1}',
    examTip: 'In 10-mark answers, always draw the sub-tree rotation diagram before listing the step-by-step pseudo-code!',
  };
}

/**
 * Generates 1-Page Printable Formula & Theorem Sheets for any Unit
 */
export function generateUnitFormulaSheet(
  subjectName: string,
  unitTitle: string,
  unitNumber: number
): UnitFormulaSheet {
  return {
    subjectName,
    unitTitle,
    unitNumber,
    keyDefinitions: [
      {
        term: 'Time Complexity T(N)',
        definition: 'The asymptotic upper bound on runtime execution steps as input size N grows to infinity.',
      },
      {
        term: 'Balance Factor (BF)',
        definition: 'The difference between the height of the left sub-tree and the right sub-tree of a binary tree node.',
      },
      {
        term: 'CIA Triad',
        definition: 'Confidentiality (encryption), Integrity (hashing), and Availability (uptime & redundancy).',
      },
    ],
    coreFormulas: [
      {
        name: 'AVL Max Height Guarantee',
        formula: 'H_{max} < 1.44 \\cdot \\log_2(N + 2)',
        variables: 'H = Max tree height, N = Total node count',
      },
      {
        name: 'Shannon Entropy Calculation',
        formula: 'H(X) = - \\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i)',
        variables: 'P(x_i) = Probability of message symbol x_i',
      },
      {
        name: 'RSA Key Generation Modulus',
        formula: 'n = p \\cdot q, \\quad \\phi(n) = (p-1)(q-1)',
        variables: 'p, q = Distinct prime numbers',
      },
    ],
    keyTheorems: [
      {
        name: 'Master Theorem for Divide-and-Conquer',
        statement: 'T(N) = aT(N/b) + f(N). Compares N^{\\log_b a} with f(N) to determine recursion tree bounds.',
        condition: 'Requires a >= 1, b > 1, and f(N) asymptotically positive.',
      },
      {
        name: 'Euler Totient Theorem',
        statement: 'a^{\\phi(n)} \\equiv 1 \\pmod n \\quad \\text{when } \\gcd(a, n) = 1.',
        condition: 'Foundation for RSA public-key cryptographic exponent decryption.',
      },
    ],
  };
}
