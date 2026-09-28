/**
 * PYQ (Previous Year Question) Frequency Analyzer & Mistake Notebook Utility
 */

export interface PyqTopicAnalysis {
  topicId: string;
  topicName: string;
  subjectCode: string;
  yearFrequencies: { year: number; appearances: number; markValue: 5 | 10 }[];
  totalAppearances: number;
  probabilityRating: 'High Probability (90%+)' | 'Medium Frequency (60%)' | 'Occasional (30%)';
  recommendedPreparation: string;
}

export interface MistakeLogEntry {
  id: string;
  subjectCode: string;
  topicName: string;
  question: string;
  userWrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  loggedAt: string;
  reviewed: boolean;
}

/**
 * MOCK PYQ Analysis Data for Subjects
 */
export function getPyqAnalysisForSubject(subjectCode: string): PyqTopicAnalysis[] {
  return [
    {
      topicId: 'pyq-1',
      topicName: 'AVL Trees Single & Double Rotations (LL, RR, LR, RL)',
      subjectCode,
      yearFrequencies: [
        { year: 2022, appearances: 2, markValue: 10 },
        { year: 2023, appearances: 1, markValue: 10 },
        { year: 2024, appearances: 2, markValue: 5 },
        { year: 2025, appearances: 1, markValue: 10 },
      ],
      totalAppearances: 6,
      probabilityRating: 'High Probability (90%+)',
      recommendedPreparation: 'Master step-by-step balance factor recalculations and sub-tree rotation diagrams.',
    },
    {
      topicId: 'pyq-2',
      topicName: 'B-Tree & B+ Tree Insertion & Node Splitting',
      subjectCode,
      yearFrequencies: [
        { year: 2021, appearances: 1, markValue: 10 },
        { year: 2023, appearances: 1, markValue: 10 },
        { year: 2025, appearances: 1, markValue: 10 },
      ],
      totalAppearances: 3,
      probabilityRating: 'High Probability (90%+)',
      recommendedPreparation: 'Practice node split propagation when max degree m is exceeded.',
    },
    {
      topicId: 'pyq-3',
      topicName: 'SHA-256 vs RSA Cryptographic Comparisons',
      subjectCode,
      yearFrequencies: [
        { year: 2022, appearances: 1, markValue: 5 },
        { year: 2024, appearances: 1, markValue: 5 },
      ],
      totalAppearances: 2,
      probabilityRating: 'Medium Frequency (60%)',
      recommendedPreparation: 'Compare symmetric key exchange vs asymmetric public key infrastructure.',
    },
  ];
}

/**
 * Sample Mistake Notebook Log Entries
 */
export function getSampleMistakeNotebook(): MistakeLogEntry[] {
  return [
    {
      id: 'mistake-1',
      subjectCode: 'CS301',
      topicName: 'AVL Rotations',
      question: 'Which rotation resolves a Left-Right (LR) imbalance in AVL trees?',
      userWrongAnswer: 'Single Right Rotation',
      correctAnswer: 'Left Rotation on Left Child followed by Right Rotation on Node',
      explanation: 'LR imbalance requires a 2-step double rotation: left rotate the left child, then right rotate the unbalanced node.',
      loggedAt: '2 hours ago',
      reviewed: false,
    },
    {
      id: 'mistake-2',
      subjectCode: 'CS302',
      topicName: 'SQL Normalization',
      question: 'Which normal form eliminates transitive functional dependencies?',
      userWrongAnswer: 'Second Normal Form (2NF)',
      correctAnswer: 'Third Normal Form (3NF)',
      explanation: '2NF eliminates partial dependencies; 3NF eliminates transitive dependencies X -> Y -> Z.',
      loggedAt: 'Yesterday',
      reviewed: true,
    },
  ];
}
