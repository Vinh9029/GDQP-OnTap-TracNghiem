import { Question } from "../types";
import { part1_1_80 } from "./part1_1_80";
import { part1_81_160 } from "./part1_81_160";
import { part2_1_80 } from "./part2_1_80";
import { part2_81_160 } from "./part2_81_160";

export const part1Questions: Question[] = [
  ...part1_1_80,
  ...part1_81_160
];

export const part2Questions: Question[] = [
  ...part2_1_80,
  ...part2_81_160
];

export const getQuestionsByPart = (part: 1 | 2): Question[] => {
  return part === 1 ? part1Questions : part2Questions;
};
