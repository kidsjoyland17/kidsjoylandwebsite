/**
 * Default subjects for each class.
 * Used as fallback when no custom subjects are saved in the DB for a class.
 *
 * Usage in controller:
 *   import { DEFAULT_SUBJECTS } from '../constants/classSubjects.js';
 *   const subjects = dbSubjects.length ? dbSubjects : DEFAULT_SUBJECTS[className] ?? [];
 */

export const DEFAULT_SUBJECTS = {
  // Pre-Nursery → UKG
  "Pre-Nursery": ["English", "Mathematics", "Hindi", "EVS", "Drawing"],
  Nursery:       ["English", "Mathematics", "Hindi", "EVS", "Drawing"],
  LKG:           ["English", "Mathematics", "Hindi", "EVS", "Drawing"],
  UKG:           ["English", "Mathematics", "Hindi", "EVS", "Drawing"],

  // STD 1 & 2
  "1": ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "EVS", "Computer", "M. Science", "Drawing"],
  "2": ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "EVS", "Computer", "M. Science", "Drawing"],

  // STD 3 to 10
  "3":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "4":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "5":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "6":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "7":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "8":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "9":  ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
  "10": ["Eng. Literature", "Eng. Language", "Hindi Literature", "Hindi Language", "Mathematics", "G.K.", "Science", "S. Studies", "Computer", "M. Science", "Drawing"],
};

/** Returns default subjects for a class, or empty array if class not found */
export const getDefaultSubjects = (className) =>
  DEFAULT_SUBJECTS[className] ?? [];