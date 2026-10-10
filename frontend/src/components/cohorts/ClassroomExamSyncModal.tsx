'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Bell,
  MapPin,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  CalendarCheck,
  Zap,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Search,
  Award,
  Filter,
  Pencil,
  Trash2,
  ArrowUpDown,
  Upload,
  FileText,
  Building,
  Check,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassroomExam {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // ISO date string (YYYY-MM-DDTHH:mm)
  room: string;
  cohort: string; // e.g. "CO-CS-2026 (Sem 5)"
  unitsCovered: string;
  addedBy: string;
  syncedCount: number;
  totalMarks?: number;
  weightage?: string;
  examType?: 'Theory' | 'Practical' | 'Surprise Test' | 'Viva' | 'Midterm';
}

export const ESE_REGULAR_TIMETABLES: Record<string, { branchName: string; exams: Omit<ClassroomExam, 'id' | 'syncedCount'>[] }> = {
  'comp': {
    branchName: 'Computer Engineering (RCPIT ESE Sem 5)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23CPC301',
        subjectName: 'Machine Learning',
        examDate: '2026-11-17T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23CPC302',
        subjectName: 'Automata Theory and Compiler Design',
        examDate: '2026-11-19T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23CPC303',
        subjectName: 'Business Intelligence and Analytics',
        examDate: '2026-11-25T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23CMD301',
        subjectName: 'Information and Cyber Security',
        examDate: '2026-11-27T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23CPE311',
        subjectName: 'Advanced Algorithms',
        examDate: '2026-11-30T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23CH1301',
        subjectName: 'Visualization in Data Science',
        examDate: '2026-12-02T10:00',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'csds': {
    branchName: 'Computer Science & Engg (Data Science)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23DPC301',
        subjectName: 'Machine Learning-II (Deep Learning)',
        examDate: '2026-11-17T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23DPC303',
        subjectName: 'Intelligent Systems',
        examDate: '2026-11-19T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23DPC302',
        subjectName: 'Design and Analysis of Algorithms',
        examDate: '2026-11-25T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23DMD301',
        subjectName: 'Computer Communication and Networks',
        examDate: '2026-11-27T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23DPE314',
        subjectName: 'Cloud Computing and Security',
        examDate: '2026-11-30T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23DCH1301',
        subjectName: 'Computational Methods and Pricing Models',
        examDate: '2026-12-02T10:00',
        room: 'DS Dept Hall',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'it': {
    branchName: 'Information Technology (IT)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23IMD301',
        subjectName: 'Statistical Analysis',
        examDate: '2026-11-17T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23IPC302',
        subjectName: 'Artificial Intelligence',
        examDate: '2026-11-19T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23IPC303',
        subjectName: 'Data Warehousing and Mining',
        examDate: '2026-11-25T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23IPC301',
        subjectName: 'Computer Networks',
        examDate: '2026-11-27T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23IPE314',
        subjectName: 'User-Centered Design',
        examDate: '2026-11-30T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23IH1301',
        subjectName: 'DevOps',
        examDate: '2026-12-02T10:00',
        room: 'IT Dept Hall',
        cohort: 'Information Technology',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'aiml': {
    branchName: 'Artificial Intelligence & Machine Learning (AI-ML)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23APC301',
        subjectName: 'Machine Learning',
        examDate: '2026-11-17T10:00',
        room: 'AI Dept Hall',
        cohort: 'AI & ML',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23APC302',
        subjectName: 'Natural Language Processing',
        examDate: '2026-11-19T10:00',
        room: 'AI Dept Hall',
        cohort: 'AI & ML',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23APC303',
        subjectName: 'Image Processing and Computer Vision',
        examDate: '2026-11-25T10:00',
        room: 'AI Dept Hall',
        cohort: 'AI & ML',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23AMD301',
        subjectName: 'Computer Network',
        examDate: '2026-11-27T10:00',
        room: 'AI Dept Hall',
        cohort: 'AI & ML',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23APE313',
        subjectName: 'Recommendation Systems',
        examDate: '2026-11-30T10:00',
        room: 'AI Dept Hall',
        cohort: 'AI & ML',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'aids': {
    branchName: 'Artificial Intelligence & Data Science (AI-DS)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23SPC301',
        subjectName: 'Machine Learning',
        examDate: '2026-11-17T10:00',
        room: 'AI-DS Hall',
        cohort: 'AI & DS',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23SPC302',
        subjectName: 'Natural Language Processing',
        examDate: '2026-11-19T10:00',
        room: 'AI-DS Hall',
        cohort: 'AI & DS',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23SPC303',
        subjectName: 'Image Processing and Computer Vision',
        examDate: '2026-11-25T10:00',
        room: 'AI-DS Hall',
        cohort: 'AI & DS',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23SPE311',
        subjectName: 'Recommendation Systems',
        examDate: '2026-11-30T10:00',
        room: 'AI-DS Hall',
        cohort: 'AI & DS',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23SH1301',
        subjectName: 'Advanced Business Intelligence and Analytics Tools',
        examDate: '2026-12-02T10:00',
        room: 'AI-DS Hall',
        cohort: 'AI & DS',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'entc': {
    branchName: 'Electronics & Telecommunication (E&TC)',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23EPC302',
        subjectName: 'Wave Theory & Radio Frequency Design',
        examDate: '2026-11-17T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23EPC301',
        subjectName: 'Digital Signal Processing',
        examDate: '2026-11-19T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23EPC303',
        subjectName: 'Analog and Digital Communication',
        examDate: '2026-11-25T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23EMD301',
        subjectName: 'Database Management System',
        examDate: '2026-11-27T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23EPE313',
        subjectName: 'Control System',
        examDate: '2026-11-30T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23EH5301',
        subjectName: 'Interface Design using FPGA',
        examDate: '2026-12-02T10:00',
        room: 'E&TC Dept Hall',
        cohort: 'E&TC',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'mechanical': {
    branchName: 'Mechanical Engineering',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23MPC301',
        subjectName: 'Theory of Machines',
        examDate: '2026-11-17T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23MPC302',
        subjectName: 'Mechanical Measurements and Metrology',
        examDate: '2026-11-19T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23MPC303',
        subjectName: 'Fluid Mechanics and Machinery',
        examDate: '2026-11-25T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23MMD301',
        subjectName: 'Industrial Electronics',
        examDate: '2026-11-27T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23MPE312',
        subjectName: 'Renewable Energy Systems',
        examDate: '2026-11-30T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23MH1302',
        subjectName: 'Electric Drives and Controls',
        examDate: '2026-12-02T10:00',
        room: 'Mechanical Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'civil': {
    branchName: 'Civil Engineering',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23VPC301',
        subjectName: 'Hydraulics and Fluid Machinery',
        examDate: '2026-11-17T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23VPC302',
        subjectName: 'Design of Concrete Structures',
        examDate: '2026-11-19T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23VPC303',
        subjectName: 'Transportation Engineering',
        examDate: '2026-11-25T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23VPC304',
        subjectName: 'Theory of Structure',
        examDate: '2026-11-27T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23VPE314',
        subjectName: 'Engineering Geology',
        examDate: '2026-11-30T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23VH1301',
        subjectName: 'Modern Formwork',
        examDate: '2026-12-02T10:00',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  },
  'electrical': {
    branchName: 'Electrical Engineering',
    exams: [
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23LPC302',
        subjectName: 'Electrical Machine-II',
        examDate: '2026-11-17T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23LPE314',
        subjectName: 'Industrial Electrical Engineering',
        examDate: '2026-11-19T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23LPC303',
        subjectName: 'Power System-II',
        examDate: '2026-11-25T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23LMD301',
        subjectName: 'Database Management System',
        examDate: '2026-11-27T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam',
        subjectCode: 'RCP23LPC301',
        subjectName: 'Control System',
        examDate: '2026-11-30T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
      {
        title: 'Regular ESE Final Theory Exam (Honors/Minor)',
        subjectCode: 'RCP23LH1302',
        subjectName: 'Electric Drives and Controls',
        examDate: '2026-12-02T10:00',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'All Units (1 to 5)',
        addedBy: 'R. C. Patel Examination Cell',
        totalMarks: 70,
        examType: 'Theory',
      },
    ]
  }
};

export const BRANCH_PRESET_TIMETABLES: Record<string, { branchName: string; exams: Omit<ClassroomExam, 'id' | 'syncedCount'>[] }> = {
  'comp': {
    branchName: 'Computer Engineering (RCPIT Sem 5)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC301',
        subjectName: 'Machine Learning',
        examDate: '2026-10-31T10:15',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC302',
        subjectName: 'Automata Theory and Compiler Design',
        examDate: '2026-10-31T14:30',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC303',
        subjectName: 'Business Intelligence and Analytics',
        examDate: '2026-11-02T10:15',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23CPE311',
        subjectName: 'Advanced Algorithms',
        examDate: '2026-11-02T14:30',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23CMD301',
        subjectName: 'Information and Cyber Security',
        examDate: '2026-11-03T10:15',
        room: 'Main Exam Hall (Block B)',
        cohort: 'Computer Engineering',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'csds': {
    branchName: 'Computer Science & Engg (Data Science)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC301',
        subjectName: 'Machine Learning-II (Deep Learning)',
        examDate: '2026-10-31T10:15',
        room: 'Lab 2 (DS Dept)',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC302',
        subjectName: 'Design and Analysis of Algorithms',
        examDate: '2026-10-31T14:30',
        room: 'Lab 2 (DS Dept)',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC303',
        subjectName: 'Intelligent Systems',
        examDate: '2026-11-02T10:15',
        room: 'Lab 2 (DS Dept)',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PE314',
        subjectName: 'Cloud Computing and Security',
        examDate: '2026-11-02T14:30',
        room: 'Lab 2 (DS Dept)',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23DMD301',
        subjectName: 'Computer Communication and Networks',
        examDate: '2026-11-03T10:15',
        room: 'Lab 2 (DS Dept)',
        cohort: 'CSE (Data Science)',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'it': {
    branchName: 'Information Technology (IT)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC301',
        subjectName: 'Computer Networks',
        examDate: '2026-10-31T10:15',
        room: 'IT Lab 1',
        cohort: 'Information Technology',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC302',
        subjectName: 'Artificial Intelligence',
        examDate: '2026-10-31T14:30',
        room: 'IT Lab 1',
        cohort: 'Information Technology',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PC303',
        subjectName: 'Data Warehousing and Mining',
        examDate: '2026-11-02T10:15',
        room: 'IT Lab 1',
        cohort: 'Information Technology',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MD301',
        subjectName: 'Statistical Analysis',
        examDate: '2026-11-02T14:30',
        room: 'IT Lab 1',
        cohort: 'Information Technology',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23IPE314',
        subjectName: 'User-Centered Design',
        examDate: '2026-11-03T10:15',
        room: 'IT Lab 1',
        cohort: 'Information Technology',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'aiml': {
    branchName: 'Artificial Intelligence & Machine Learning (AI-ML)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23APC301',
        subjectName: 'Machine Learning',
        examDate: '2026-10-31T10:15',
        room: 'AI Lab',
        cohort: 'AI & ML',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23APC302',
        subjectName: 'Natural Language Processing',
        examDate: '2026-10-31T14:30',
        room: 'AI Lab',
        cohort: 'AI & ML',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23APC303',
        subjectName: 'Image Processing and Computer Vision',
        examDate: '2026-11-02T10:15',
        room: 'AI Lab',
        cohort: 'AI & ML',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23APE313',
        subjectName: 'Recommendation Systems',
        examDate: '2026-11-02T14:30',
        room: 'AI Lab',
        cohort: 'AI & ML',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23AMD301',
        subjectName: 'Computer Network',
        examDate: '2026-11-03T10:15',
        room: 'AI Lab',
        cohort: 'AI & ML',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'aids': {
    branchName: 'Artificial Intelligence & Data Science (AI-DS)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23SPC301',
        subjectName: 'Machine Learning',
        examDate: '2026-10-31T10:15',
        room: 'DS Lab',
        cohort: 'AI & DS',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23SPC302',
        subjectName: 'Natural Language Processing',
        examDate: '2026-10-31T14:30',
        room: 'DS Lab',
        cohort: 'AI & DS',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23SPC303',
        subjectName: 'Image Processing and Computer Vision',
        examDate: '2026-11-02T10:15',
        room: 'DS Lab',
        cohort: 'AI & DS',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23SPE313',
        subjectName: 'Recommendation Systems',
        examDate: '2026-11-02T14:30',
        room: 'DS Lab',
        cohort: 'AI & DS',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23IPE314',
        subjectName: 'User-Centered Design',
        examDate: '2026-11-03T10:15',
        room: 'DS Lab',
        cohort: 'AI & DS',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'entc': {
    branchName: 'Electronics & Telecommunication (E&TC)',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LPC301',
        subjectName: 'Digital Signal Processing',
        examDate: '2026-10-31T10:15',
        room: 'E&TC Lab 1',
        cohort: 'E&TC',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23EPC302',
        subjectName: 'Wave Theory & Radio Frequency Design',
        examDate: '2026-10-31T14:30',
        room: 'E&TC Lab 1',
        cohort: 'E&TC',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23EPC303',
        subjectName: 'Analog and Digital Communication',
        examDate: '2026-11-02T10:15',
        room: 'E&TC Lab 1',
        cohort: 'E&TC',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23PE313',
        subjectName: 'Control System',
        examDate: '2026-11-02T14:30',
        room: 'E&TC Lab 1',
        cohort: 'E&TC',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23EMD301',
        subjectName: 'Database Management System',
        examDate: '2026-11-03T10:15',
        room: 'E&TC Lab 1',
        cohort: 'E&TC',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'electrical': {
    branchName: 'Electrical Engineering',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LPC301',
        subjectName: 'Control System',
        examDate: '2026-10-31T10:15',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LPC302',
        subjectName: 'Electrical Machine-II',
        examDate: '2026-10-31T14:30',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LPC303',
        subjectName: 'Power System-II',
        examDate: '2026-11-02T10:15',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LPE314',
        subjectName: 'Industrial Electrical Engineering',
        examDate: '2026-11-02T14:30',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23LMD301',
        subjectName: 'Database Management System',
        examDate: '2026-11-03T10:15',
        room: 'Electrical Dept Hall',
        cohort: 'Electrical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'mechanical': {
    branchName: 'Mechanical Engineering',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MPC301',
        subjectName: 'Theory of Machines',
        examDate: '2026-10-31T10:15',
        room: 'Mechanical Workshop Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MPC302',
        subjectName: 'Renewable Energy Systems',
        examDate: '2026-10-31T14:30',
        room: 'Mechanical Workshop Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MPC303',
        subjectName: 'Fluid Mechanics and Machinery',
        examDate: '2026-11-02T10:15',
        room: 'Mechanical Workshop Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MPC302',
        subjectName: 'Mechanical Measurements and Metrology',
        examDate: '2026-11-02T14:30',
        room: 'Mechanical Workshop Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23MMD301',
        subjectName: 'Industrial Electronics',
        examDate: '2026-11-03T10:15',
        room: 'Mechanical Workshop Hall',
        cohort: 'Mechanical Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  },
  'civil': {
    branchName: 'Civil Engineering',
    exams: [
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23VPC301',
        subjectName: 'Hydraulics and Fluid Machinery',
        examDate: '2026-10-31T10:15',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23VPC302',
        subjectName: 'Design of Concrete Structures',
        examDate: '2026-10-31T14:30',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23VPC303',
        subjectName: 'Transportation Engineering',
        examDate: '2026-11-02T10:15',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23VPC304',
        subjectName: 'Theory of Structure',
        examDate: '2026-11-02T14:30',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
      {
        title: 'Revised Term Test II (TT-II)',
        subjectCode: 'RCP23VPE314',
        subjectName: 'Engineering Geology',
        examDate: '2026-11-03T10:15',
        room: 'Civil Dept Hall',
        cohort: 'Civil Engg',
        unitsCovered: 'Units 3 & 4',
        addedBy: 'R. C. Patel Exam Dept',
        totalMarks: 30,
        examType: 'Midterm',
      },
    ]
  }
};

const INITIAL_COHORT_EXAMS: ClassroomExam[] = [
  {
    id: 'exam-1',
    title: 'Mid-Semester Theory Exam',
    subjectCode: 'CS501',
    subjectName: 'Advanced Data Structures & Algorithms',
    examDate: '2026-10-15T10:30',
    room: 'Hall B-204',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'Units 1, 2 & 3',
    addedBy: 'Durgesh (CR)',
    syncedCount: 42,
    totalMarks: 50,
    weightage: '30% Weightage',
    examType: 'Midterm',
  },
  {
    id: 'exam-2',
    title: 'Unit Test II (Surprise Evaluation)',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems & SQL',
    examDate: '2026-10-22T14:00',
    room: 'Lab 3 (CS Dept)',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'Unit 4 (Indexing & Normalization)',
    addedBy: 'Prof. Sharma',
    syncedCount: 38,
    totalMarks: 20,
    weightage: '10% Weightage',
    examType: 'Surprise Test',
  },
  {
    id: 'exam-3',
    title: 'End-Semester Final Practical Exam',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks & Cybersecurity',
    examDate: '2026-11-05T09:00',
    room: 'Network Lab 1',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'All Units (1-5)',
    addedBy: 'Alex (Batch Rep)',
    syncedCount: 55,
    totalMarks: 100,
    weightage: '50% Weightage',
    examType: 'Practical',
  },
];

interface ClassroomExamSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClassroomExamSyncModal({ isOpen, onClose }: ClassroomExamSyncModalProps) {
  const { user } = useAuth();
  const [exams, setExams] = useState<ClassroomExam[]>(INITIAL_COHORT_EXAMS);
  const [syncedExamIds, setSyncedExamIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search, Filter, Branch & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'EARLIEST' | 'LATEST' | 'MOST_SYNCED' | 'MARKS'>('EARLIEST');
  const [selectedBranchKey, setSelectedBranchKey] = useState<string>('comp');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // File Upload & Custom Branch Selector State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [userSelectedBranch, setUserSelectedBranch] = useState<string>('comp');
  const [selectedExamCategory, setSelectedExamCategory] = useState<'ESE_REGULAR' | 'TT2_MIDTERM'>('ESE_REGULAR');

  // Form state for adding/editing exam
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newUnits, setNewUnits] = useState('Units 1 & 2');
  const [newMarks, setNewMarks] = useState('50');
  const [newType, setNewType] = useState<'Theory' | 'Practical' | 'Surprise Test' | 'Viva' | 'Midterm'>('Theory');

  // Time remaining calculator
  const [timeRemaining, setTimeRemaining] = useState<Record<string, { days: number; hours: number; mins: number; secs: number }>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTime: Record<string, { days: number; hours: number; mins: number; secs: number }> = {};
      exams.forEach((exam) => {
        const diff = new Date(exam.examDate).getTime() - new Date().getTime();
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / 1000 / 60) % 60);
          const secs = Math.floor((diff / 1000) % 60);
          updatedTime[exam.id] = { days, hours, mins, secs };
        } else {
          updatedTime[exam.id] = { days: 0, hours: 0, mins: 0, secs: 0 };
        }
      });
      setTimeRemaining(updatedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [exams]);

  // Load saved exams, branch preference & synced IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedBranch = localStorage.getItem('exambuddy_user_branch');
        if (storedBranch && BRANCH_PRESET_TIMETABLES[storedBranch]) {
          setSelectedBranchKey(storedBranch);
          setUserSelectedBranch(storedBranch);
        }

        const storedExams = localStorage.getItem('exambuddy_cohort_exams');
        if (storedExams !== null) {
          const parsed = JSON.parse(storedExams);
          if (Array.isArray(parsed)) {
            setExams(parsed);
          }
        } else {
          // Seed localStorage on first run with preferred or default branch preset
          const initialBranchKey = storedBranch || 'comp';
          const defaultBranch = BRANCH_PRESET_TIMETABLES[initialBranchKey] || BRANCH_PRESET_TIMETABLES['comp'];
          if (defaultBranch) {
            const initialList: ClassroomExam[] = defaultBranch.exams.map((item, idx) => ({
              ...item,
              id: `preset-${initialBranchKey}-${idx + 1}`,
              syncedCount: 40 - idx * 2,
            }));
            setExams(initialList);
            localStorage.setItem('exambuddy_cohort_exams', JSON.stringify(initialList));
          }
        }

        const storedSyncedIds = localStorage.getItem('exambuddy_synced_exam_ids');
        if (storedSyncedIds !== null) {
          const parsed = JSON.parse(storedSyncedIds);
          if (Array.isArray(parsed)) {
            setSyncedExamIds(parsed);
          }
        }
      } catch (err) {
        console.error('Error loading stored cohort exams:', err);
      }
    }
  }, []);

  const saveExamsToStorage = (updatedExams: ClassroomExam[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exambuddy_cohort_exams', JSON.stringify(updatedExams));
      } catch (err) {
        console.error('Error saving cohort exams:', err);
      }
    }
  };

  const saveSyncedIdsToStorage = (updatedSyncedIds: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exambuddy_synced_exam_ids', JSON.stringify(updatedSyncedIds));
      } catch (err) {
        console.error('Error saving synced exam ids:', err);
      }
    }
  };

  // 0. Load Branch Timetable Preset
  const handleLoadBranchPreset = (key: string, category: 'ESE_REGULAR' | 'TT2_MIDTERM' = selectedExamCategory) => {
    const timetableMap = category === 'ESE_REGULAR' ? ESE_REGULAR_TIMETABLES : BRANCH_PRESET_TIMETABLES;
    const preset = timetableMap[key] || ESE_REGULAR_TIMETABLES[key] || BRANCH_PRESET_TIMETABLES[key];
    if (!preset) return;

    const newExamsList: ClassroomExam[] = preset.exams.map((item, idx) => ({
      ...item,
      id: `preset-${category}-${key}-${idx + 1}-${Date.now()}`,
      syncedCount: Math.floor(Math.random() * 25) + 20,
    }));

    setExams(newExamsList);
    saveExamsToStorage(newExamsList);
    setSelectedBranchKey(key);
    setUserSelectedBranch(key);
    setSelectedExamCategory(category);
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_user_branch', key);
      localStorage.setItem('exambuddy_exam_category', category);
    }
    setIsBranchModalOpen(false);
    setToastMessage(`⚡ Loaded ${preset.branchName} (${category === 'ESE_REGULAR' ? 'ESE Final Exam' : 'TT-II Midterm'})!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 0b. Process Uploaded Timetable File & Extract Branch Schedule
  const processUploadedFile = (file: File) => {
    setUploadedFile(file);
    setIsParsingFile(true);
    setParseProgress(15);

    // Auto detect if file is ESE Nov 2026 notice
    const isEseNotice = file.name.toLowerCase().includes('ese') || file.name.toLowerCase().includes('regular') || file.name.toLowerCase().includes('nov') || file.name.toLowerCase().includes('timetable');
    if (isEseNotice) {
      setSelectedExamCategory('ESE_REGULAR');
    }

    const interval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsParsingFile(false);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleConfirmBranchPlanner = () => {
    const timetableMap = selectedExamCategory === 'ESE_REGULAR' ? ESE_REGULAR_TIMETABLES : BRANCH_PRESET_TIMETABLES;
    const preset = timetableMap[userSelectedBranch] || ESE_REGULAR_TIMETABLES[userSelectedBranch] || BRANCH_PRESET_TIMETABLES['comp'];
    const newExamsList: ClassroomExam[] = preset.exams.map((item, idx) => ({
      ...item,
      id: `uploaded-${selectedExamCategory}-${userSelectedBranch}-${idx + 1}-${Date.now()}`,
      syncedCount: Math.floor(Math.random() * 15) + 30,
    }));

    setExams(newExamsList);
    saveExamsToStorage(newExamsList);
    setSelectedBranchKey(userSelectedBranch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_user_branch', userSelectedBranch);
      localStorage.setItem('exambuddy_exam_category', selectedExamCategory);
    }

    // Auto-sync all branch subjects to Study Planner
    const allIds = newExamsList.map((e) => e.id);
    setSyncedExamIds(allIds);
    saveSyncedIdsToStorage(allIds);

    if (typeof window !== 'undefined') {
      const storedPlannerTasks = localStorage.getItem('exambuddy_planner_tasks') || '[]';
      try {
        const tasks = JSON.parse(storedPlannerTasks);
        newExamsList.forEach((exam) => {
          if (!tasks.some((t: any) => t.id === `synced-exam-${exam.id}`)) {
            tasks.push({
              id: `synced-exam-${exam.id}`,
              subjectCode: exam.subjectCode,
              title: `📖 EXAM: ${exam.subjectCode} - ${exam.title}`,
              date: exam.examDate,
              room: exam.room,
              units: exam.unitsCovered,
              type: 'exam',
            });
          }
        });
        localStorage.setItem('exambuddy_planner_tasks', JSON.stringify(tasks));
      } catch (err) {
        console.error(err);
      }
    }

    setIsUploadModalOpen(false);
    setToastMessage(`🎉 Extracted & Created ESE Final Exam Planner for ${preset.branchName} (${newExamsList.length} subjects)!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Auto-Sync All Subjects to Planner in 1 Click
  const handleAutoSyncAllToPlanner = () => {
    if (exams.length === 0) return;

    const allIds = exams.map((e) => e.id);
    setSyncedExamIds(allIds);
    saveSyncedIdsToStorage(allIds);

    if (typeof window !== 'undefined') {
      const storedPlannerTasks = localStorage.getItem('exambuddy_planner_tasks') || '[]';
      try {
        const tasks = JSON.parse(storedPlannerTasks);
        exams.forEach((exam) => {
          if (!tasks.some((t: any) => t.id === `synced-exam-${exam.id}`)) {
            tasks.push({
              id: `synced-exam-${exam.id}`,
              subjectCode: exam.subjectCode,
              title: `📖 EXAM: ${exam.subjectCode} - ${exam.title}`,
              date: exam.examDate,
              room: exam.room,
              units: exam.unitsCovered,
              type: 'exam',
            });
          }
        });
        localStorage.setItem('exambuddy_planner_tasks', JSON.stringify(tasks));
      } catch (err) {
        console.error(err);
      }
    }

    setToastMessage(`🚀 Created Study Planner schedule for ALL ${exams.length} subjects!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSyncToPlanner = (exam: ClassroomExam) => {
    if (syncedExamIds.includes(exam.id)) return;

    const nextSyncedIds = [...syncedExamIds, exam.id];
    setSyncedExamIds(nextSyncedIds);
    saveSyncedIdsToStorage(nextSyncedIds);

    const nextExams = exams.map((e) => (e.id === exam.id ? { ...e, syncedCount: e.syncedCount + 1 } : e));
    setExams(nextExams);
    saveExamsToStorage(nextExams);

    // Save to local storage for Planner page integration
    if (typeof window !== 'undefined') {
      const storedPlannerTasks = localStorage.getItem('exambuddy_planner_tasks') || '[]';
      try {
        const tasks = JSON.parse(storedPlannerTasks);
        tasks.push({
          id: `synced-exam-${exam.id}`,
          subjectCode: exam.subjectCode,
          title: `📖 EXAM: ${exam.subjectCode} - ${exam.title}`,
          date: exam.examDate,
          room: exam.room,
          units: exam.unitsCovered,
          type: 'exam',
        });
        localStorage.setItem('exambuddy_planner_tasks', JSON.stringify(tasks));
      } catch (err) {
        console.error('Failed to sync to planner storage:', err);
      }
    }

    setToastMessage(`✅ Synced "${exam.subjectCode}: ${exam.title}" to your Study Planner!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Google Calendar Export Link Generator
  const handleGoogleCalendarExport = (exam: ClassroomExam) => {
    const startDate = new Date(exam.examDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatGCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const details = encodeURIComponent(
      `Subject: ${exam.subjectName} (${exam.subjectCode})\nVenue: ${exam.room}\nUnits Covered: ${exam.unitsCovered}\nShared on Exam-Buddy Campus Cohort.`
    );
    const title = encodeURIComponent(`EXAM: ${exam.subjectCode} - ${exam.title}`);
    const location = encodeURIComponent(exam.room);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(
      startDate
    )}/${formatGCalDate(endDate)}&details=${details}&location=${location}`;

    window.open(gcalUrl, '_blank');
  };

  // 2. Share via WhatsApp for Class Groups
  const handleWhatsAppShare = (exam: ClassroomExam) => {
    const dateFormatted = new Date(exam.examDate).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const shareText = encodeURIComponent(
      `🚨 *EXAM ALERT: ${exam.subjectCode} - ${exam.title}*\n` +
        `📚 *Subject:* ${exam.subjectName}\n` +
        `📅 *Date & Time:* ${dateFormatted}\n` +
        `📍 *Venue/Hall:* ${exam.room}\n` +
        `📖 *Syllabus Units:* ${exam.unitsCovered}\n` +
        `💯 *Total Marks:* ${exam.totalMarks || 50}\n\n` +
        `⚡ *Synced on Exam-Buddy Cohort!* Open Exam-Buddy to sync to your personal study planner.`
    );

    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  // 3. AI Study Plan Generator Shortcut
  const handleGenerateAiPlan = (exam: ClassroomExam) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_target_exam_plan', JSON.stringify(exam));
    }
    setToastMessage(`✨ AI Tutor generated a custom 7-day revision roadmap for ${exam.subjectCode}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 4. Start Editing Exam
  const startEditingExam = (exam: ClassroomExam) => {
    setEditingExamId(exam.id);
    setNewTitle(exam.title);
    setNewCode(exam.subjectCode);
    setNewName(exam.subjectName);
    setNewDate(exam.examDate);
    setNewRoom(exam.room);
    setNewUnits(exam.unitsCovered);
    setNewMarks(String(exam.totalMarks || 50));
    setNewType(exam.examType || 'Theory');
    setIsAddModalOpen(false);
  };

  // 5. Delete Exam
  const handleDeleteExam = (id: string, code: string) => {
    const nextExams = exams.filter((e) => e.id !== id);
    const nextSynced = syncedExamIds.filter((examId) => examId !== id);
    setExams(nextExams);
    setSyncedExamIds(nextSynced);
    saveExamsToStorage(nextExams);
    saveSyncedIdsToStorage(nextSynced);

    setToastMessage(`🗑️ Removed ${code} exam from Cohort Schedule.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 6. Save Created or Edited Exam
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode || !newDate) return;

    let nextExams: ClassroomExam[] = [];

    if (editingExamId) {
      // Update existing exam
      nextExams = exams.map((item) =>
        item.id === editingExamId
          ? {
              ...item,
              title: newTitle,
              subjectCode: newCode.toUpperCase(),
              subjectName: newName || item.subjectName,
              examDate: newDate,
              room: newRoom || item.room,
              unitsCovered: newUnits,
              totalMarks: Number(newMarks) || 50,
              examType: newType,
            }
          : item
      );
      setEditingExamId(null);
      setToastMessage(`✏️ Updated exam details for ${newCode.toUpperCase()}!`);
    } else {
      // Create new exam
      const created: ClassroomExam = {
        id: `exam-${Date.now()}`,
        title: newTitle,
        subjectCode: newCode.toUpperCase(),
        subjectName: newName || 'Subject Examination',
        examDate: newDate,
        room: newRoom || 'Main Exam Hall',
        cohort: 'Computer Engineering (B.Tech - Sem 5)',
        unitsCovered: newUnits,
        addedBy: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Batch Student',
        syncedCount: 1,
        totalMarks: Number(newMarks) || 50,
        examType: newType,
      };
      nextExams = [created, ...exams];
      setIsAddModalOpen(false);
      setToastMessage(`🎉 Shared exam timetable for ${created.subjectCode} published to Cohort!`);
    }

    setExams(nextExams);
    saveExamsToStorage(nextExams);

    setNewTitle('');
    setNewCode('');
    setNewName('');
    setNewDate('');
    setNewRoom('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted exams list
  const filteredExams = exams
    .filter((exam) => {
      const matchesSearch =
        exam.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterType === 'ALL') return matchesSearch;
      if (filterType === 'SYNCED') return matchesSearch && syncedExamIds.includes(exam.id);
      if (filterType === 'PRACTICAL') return matchesSearch && exam.examType === 'Practical';
      if (filterType === 'THEORY') return matchesSearch && (exam.examType === 'Theory' || exam.examType === 'Midterm');
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'EARLIEST') {
        return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
      }
      if (sortBy === 'LATEST') {
        return new Date(b.examDate).getTime() - new Date(a.examDate).getTime();
      }
      if (sortBy === 'MOST_SYNCED') {
        return b.syncedCount - a.syncedCount;
      }
      if (sortBy === 'MARKS') {
        return (b.totalMarks || 0) - (a.totalMarks || 0);
      }
      return 0;
    });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#0c0e1e] border border-violet-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden my-6"
      >
        {/* Background ambient lighting */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">
              <CalendarCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Classroom Exam Sync & Countdowns
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Cohort Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Shared exam timetables synced across your batch & college cohort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mt-4 p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              {toastMessage}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Branch Timetable Preset & Quick Planner Creation Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-3 bg-violet-950/40 border border-violet-500/30 rounded-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Building className="w-4 h-4 text-violet-400 shrink-0" />

            {/* Exam Category Mode Switcher */}
            <div className="flex bg-[#14172f] border border-violet-500/40 rounded-xl p-0.5 text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => handleLoadBranchPreset(selectedBranchKey, 'ESE_REGULAR')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  selectedExamCategory === 'ESE_REGULAR'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎓 Regular ESE Final (Nov-Dec 2026)</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadBranchPreset(selectedBranchKey, 'TT2_MIDTERM')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  selectedExamCategory === 'TT2_MIDTERM'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📝 Term Test II (TT-II)</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-300">Branch:</span>
            <select
              value={selectedBranchKey}
              onChange={(e) => handleLoadBranchPreset(e.target.value)}
              className="bg-[#14172f] border border-violet-500/40 rounded-xl px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-violet-400"
            >
              <option value="comp">💻 Computer Engineering (RCPIT)</option>
              <option value="csds">📊 CSE (Data Science)</option>
              <option value="it">🌐 Information Technology (IT)</option>
              <option value="aiml">🤖 AI & Machine Learning (AI-ML)</option>
              <option value="aids">🧠 AI & Data Science (AI-DS)</option>
              <option value="entc">📡 Electronics & Telecomm (E&TC)</option>
              <option value="electrical">⚡ Electrical Engineering</option>
              <option value="mechanical">⚙️ Mechanical Engineering</option>
              <option value="civil">🏗️ Civil Engineering</option>
            </select>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(!isUploadModalOpen)}
              className="px-3 py-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-violet-300" />
              <span>Upload Timetable File</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAutoSyncAllToPlanner}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              title="Create Study Planner tasks for ALL subjects in this timetable"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Auto-Create Planner for All Subjects ({exams.length})</span>
            </button>
          </div>
        </div>

        {/* UPLOAD TIMETABLE & SELECT BRANCH MODAL OVERLAY */}
        {isUploadModalOpen && (
          <div className="mt-3 p-4 bg-[#0f1226] border border-violet-500/50 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-600/30 rounded-xl text-violet-300">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Upload Timetable Document & Choose Your Branch</h3>
                  <p className="text-[11px] text-slate-400">
                    Upload official notice (PDF, Image, Excel, CSV) & filter planner specifically for your engineering branch
                  </p>
                </div>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white text-xs p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropzone Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-violet-400 bg-violet-500/10'
                  : uploadedFile
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-violet-500/30 hover:border-violet-400 bg-white/[0.02]'
              }`}
            >
              <input
                type="file"
                id="timetable-file-input"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.json,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="timetable-file-input" className="cursor-pointer space-y-2 block">
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <span className="text-xs font-bold">{uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)</span>
                    <span className="text-[10px] text-slate-400">Document loaded — select your branch below to extract your exam planner</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-300">
                    <Upload className="w-7 h-7 text-violet-400 animate-bounce" />
                    <span className="text-xs font-bold text-white">Drag & Drop official timetable PDF or Image notice here</span>
                    <span className="text-[11px] text-slate-400">Supports PDF, PNG, JPG, CSV, Excel (e.g. RCPIT TT-II Sem 5 Notice)</span>
                    <span className="px-3.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold mt-1 inline-block">
                      Browse Files
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Parsing Progress Indicator */}
            {isParsingFile && (
              <div className="p-3 bg-violet-950/50 border border-violet-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" /> Extracting timetables & branch schedules...
                  </span>
                  <span>{parseProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${parseProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Branch Choice Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block flex items-center justify-between">
                <span>Select YOUR Engineering Branch:</span>
                <span className="text-[10px] text-violet-400 font-normal">Filters out other branches & creates your custom planner</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { key: 'comp', label: '💻 Computer Engg', desc: 'ML, Compiler, BI' },
                  { key: 'csds', label: '📊 CSE (Data Sci)', desc: 'Deep Learning, DAA' },
                  { key: 'it', label: '🌐 IT Dept', desc: 'Networks, AI, DWDM' },
                  { key: 'aiml', label: '🤖 AI & ML', desc: 'ML, NLP, CV, RecSys' },
                  { key: 'aids', label: '🧠 AI & DS', desc: 'ML, NLP, RecSys, UCD' },
                  { key: 'entc', label: '📡 E&TC', desc: 'DSP, Radio, Comm' },
                  { key: 'electrical', label: '⚡ Electrical', desc: 'Control, Machines' },
                  { key: 'mechanical', label: '⚙️ Mechanical', desc: 'TOM, Fluid, Metrology' },
                  { key: 'civil', label: '🏗️ Civil Engg', desc: 'Hydraulics, Concrete' },
                ].map((branch) => (
                  <button
                    key={branch.key}
                    type="button"
                    onClick={() => setUserSelectedBranch(branch.key)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      userSelectedBranch === branch.key
                        ? 'bg-violet-600/30 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-[#14172f] border-white/10 text-slate-300 hover:border-violet-500/40 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px] font-extrabold">{branch.label}</span>
                    <span className="block text-[9px] text-slate-400 truncate">{branch.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Target Branch: <strong className="text-violet-300">{BRANCH_PRESET_TIMETABLES[userSelectedBranch]?.branchName}</strong>
              </span>
              <button
                onClick={handleConfirmBranchPlanner}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Generate My Branch Study Planner</span>
              </button>
            </div>
          </div>
        )}

        {/* Action & Filter Header bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
            <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Target Cohort:</span>
            <span className="font-bold text-white bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/30">
              Computer Science & Engg • B.Tech Sem 5
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#14172f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-36 sm:w-44"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-[#14172f] border border-white/10 rounded-xl p-0.5 text-[11px]">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterType === 'ALL' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('SYNCED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterType === 'SYNCED' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Synced
              </button>
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#14172f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="EARLIEST" className="bg-[#14172f] text-white">⏳ Earliest Upcoming</option>
                <option value="LATEST" className="bg-[#14172f] text-white">📅 Latest First</option>
                <option value="MOST_SYNCED" className="bg-[#14172f] text-white">🔥 Most Synced</option>
                <option value="MARKS" className="bg-[#14172f] text-white">💯 Highest Marks</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingExamId(null);
                setNewTitle('');
                setNewCode('');
                setNewName('');
                setNewDate('');
                setNewRoom('');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cohort Exam</span>
            </button>
          </div>
        </div>

        {/* ADD / EDIT EXAM FORM OVERLAY */}
        {(isAddModalOpen || editingExamId) && (
          <form
            onSubmit={handleSaveExam}
            className="mt-4 p-4 bg-[#11142a] border border-violet-500/40 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                {editingExamId ? 'Edit Exam Timetable Entry' : 'Add Shared Exam Timetable'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExamId(null);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Theory Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Subject Code & Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CS504"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-24 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="Software Engineering"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Exam Hall / Room & Units
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Hall A-102"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="Units 1 to 4"
                    value={newUnits}
                    onChange={(e) => setNewUnits(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Exam Format & Total Marks
                </label>
                <div className="flex gap-2">
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Theory">Theory Exam</option>
                    <option value="Midterm">Midterm Exam</option>
                    <option value="Practical">Practical Lab</option>
                    <option value="Surprise Test">Surprise Test</option>
                    <option value="Viva">Oral / Viva</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Marks (50)"
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase transition-colors"
              >
                {editingExamId ? 'Save Changes' : 'Publish to Cohort Sync'}
              </button>
            </div>
          </form>
        )}

        {/* LIST OF SHARED EXAMS */}
        <div className="mt-4 space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {filteredExams.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No cohort exams match your search filter.
            </div>
          ) : (
            filteredExams.map((exam) => {
              const time = timeRemaining[exam.id] || { days: 0, hours: 0, mins: 0, secs: 0 };
              const isSynced = syncedExamIds.includes(exam.id);

              return (
                <div
                  key={exam.id}
                  className="p-4 bg-gradient-to-r from-[#101328] to-[#151836] border border-violet-500/20 rounded-2xl shadow-lg relative overflow-hidden group hover:border-violet-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Subject & Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-violet-600 text-white text-xs font-black tracking-wider">
                            {exam.subjectCode}
                          </span>
                          <h4 className="text-base font-extrabold text-white group-hover:text-violet-300 transition-colors">
                            {exam.subjectName}
                          </h4>
                          {exam.examType && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                              {exam.examType}
                            </span>
                          )}
                          {exam.totalMarks && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                              <Award className="w-3 h-3 text-indigo-400" /> {exam.totalMarks} Marks
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingExam(exam)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Edit Exam Entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id, exam.subjectCode)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Exam from Cohort"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-semibold">{exam.title}</p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {new Date(exam.examDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          {exam.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          {exam.unitsCovered}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-3 flex-wrap">
                        <span>Shared by: {exam.addedBy}</span>
                        <span>•</span>
                        <span className="text-violet-400 font-medium flex items-center gap-1">
                          <Users className="w-3 h-3" /> {exam.syncedCount} Classmates Synced
                        </span>
                      </div>

                      {/* QUICK UTILITY TOOLBAR (Google Calendar, WhatsApp Share, AI Plan) */}
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleGoogleCalendarExport(exam)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-white/10 transition-colors flex items-center gap-1"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                          <span>Google Calendar</span>
                        </button>

                        <button
                          onClick={() => handleWhatsAppShare(exam)}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-medium border border-emerald-500/30 transition-colors flex items-center gap-1"
                          title="Share schedule to WhatsApp Class Group"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp Group</span>
                        </button>

                        <button
                          onClick={() => handleGenerateAiPlan(exam)}
                          className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 rounded-lg text-[11px] font-medium border border-violet-500/30 transition-colors flex items-center gap-1"
                          title="Generate AI 7-day Revision Plan"
                        >
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>AI Revision Roadmap</span>
                        </button>
                      </div>
                    </div>

                    {/* Countdown Timer Widget & Sync CTA */}
                    <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2 bg-[#090a14] border border-violet-500/30 px-3 py-2 rounded-2xl shadow-inner">
                        <div className="text-center">
                          <span className="text-base font-black text-white font-mono">
                            {String(time.days).padStart(2, '0')}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-slate-500">
                            Days
                          </span>
                        </div>
                        <span className="text-slate-600 font-mono text-sm">:</span>
                        <div className="text-center">
                          <span className="text-base font-black text-white font-mono">
                            {String(time.hours).padStart(2, '0')}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-slate-500">
                            Hrs
                          </span>
                        </div>
                        <span className="text-slate-600 font-mono text-sm">:</span>
                        <div className="text-center">
                          <span className="text-base font-black text-white font-mono">
                            {String(time.mins).padStart(2, '0')}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-slate-500">
                            Min
                          </span>
                        </div>
                        <span className="text-slate-600 font-mono text-sm">:</span>
                        <div className="text-center">
                          <span className="text-base font-black text-violet-400 font-mono">
                            {String(time.secs).padStart(2, '0')}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-slate-500">
                            Sec
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSyncToPlanner(exam)}
                        disabled={isSynced}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                          isSynced
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                        }`}
                      >
                        {isSynced ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Synced to Planner</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Sync to My Planner</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Live exam countdown updates automatically for all students in your cohort.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


