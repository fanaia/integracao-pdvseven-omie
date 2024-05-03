const fs = require("fs");
const path = require("path");

function calculateCyclomaticComplexity(functionBody) {
  const complexityRegexes = [
    /\bif\s*\(/g,
    /\belse\s*if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bdo\s*while\s*\(/g,
    /\bswitch\s*\(/g,
    /\bcase\s*\w+:/g,
    /\b\?.*:/g,
    /\b&&/g,
    /\b\|\|/g,
  ];

  let complexity = 1;

  complexityRegexes.forEach((regex) => {
    const matches = functionBody.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

function getFunctionsInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const functionMatches = fileContent.match(
    /function\s+\w+|\bconst\s+\w+\s*=\s*(\(\s*\w*\s*\)\s*=>|\s*function\s*\()/g
  );
  const functionCount = functionMatches ? functionMatches.length : 0;
  const complexity = calculateCyclomaticComplexity(fileContent);

  // Count API calls
  const apiCallMatches = fileContent.match(/\.(get|post|put|delete|patch)\(/g);
  const apiCallCount = apiCallMatches ? apiCallMatches.length : 0;

  // Count SQL queries
  const queryMatches = fileContent.match(/const\s+\w+\s*=\s*`(SELECT|UPDATE|INSERT)[^`]*`/g);
  const queryCount = queryMatches ? queryMatches.length : 0;

  // Calculate points
  const functionPoints = functionCount * 1;
  const complexityPoints = complexity * 1;
  const apiPoints = apiCallCount * 5;
  const queryPoints = queryCount * 5;
  const totalPoints = functionPoints + complexityPoints + apiPoints + queryPoints;

  return {
    file: filePath,
    functionCount,
    complexity,
    apiCalls: apiCallCount,
    queries: queryCount,
    functionPoints,
    complexityPoints,
    apiPoints,
    queryPoints,
    totalPoints,
  };
}

function getFunctionsInDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const results = [];

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const subdirectoryResults = getFunctionsInDirectory(filePath);
      results.push(...subdirectoryResults);
    } else if (filePath.endsWith(".js")) {
      const fileResults = getFunctionsInFile(filePath);
      results.push(fileResults);
    }
  }

  return results;
}

const directories = ["src"];
let table = [].concat(...directories.map((dir) => getFunctionsInDirectory(dir)));

console.table(table);

// Calculate project total
const projectTotal = table.reduce((sum, row) => sum + row.totalPoints, 0);
console.log("Project Total", projectTotal);
