module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.js'],
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageDirectory: '<rootDir>/coverage',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};