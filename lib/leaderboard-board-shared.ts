export type BoardQuiz = {
  id: string;
  title: string;
  courseKey: string;
  courseName: string;
};

export type BoardClass = {
  id: string;
  name: string;
};

export type BoardCourseGroup = {
  id: string;
  name: string;
  quizzes: BoardQuiz[];
};

export type LeaderboardBoardMeta = {
  quizzes: BoardQuiz[];
  courseGroups: BoardCourseGroup[];
  classes: BoardClass[];
};

export type BoardLeaderboardEntry = {
  rank: number;
  studentId: string;
  displayName: string;
  value: string;
  submittedAt: string;
};

export type BoardLeaderboardResult = {
  entries: BoardLeaderboardEntry[];
  error?: string;
};
