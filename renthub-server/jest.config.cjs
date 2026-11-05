/** Jest configuration for RentHub server tests */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  testMatch: [
    '<rootDir>/test/**/*.test.cjs',
    '<rootDir>/test/**/*.test.js',
  ],
  moduleFileExtensions: ['cjs', 'js', 'mjs'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
  ],
};