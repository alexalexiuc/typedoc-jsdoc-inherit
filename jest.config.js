export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  coveragePathIgnorePatterns: [
    'dist-es',
  ],
};
