// Function to calculate Levenshtein distance (edit distance) between two strings
function calculateLevenshteinDistance(a, b) {
  // Initialize a 2D array (matrix) with dimensions (a.length + 1) x (b.length + 1)
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  // Populate the matrix with the cost of edits
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      // Cost of substitution: 0 if characters match, otherwise 1
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      // Calculate the minimum cost of deletion, insertion, or substitution
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  // Return the Levenshtein distance (bottom-right cell of the matrix)
  return matrix[a.length][b.length];
}

// Function to calculate similarity between two strings as a percentage
function calculateStringSimilarity(a, b) {
  const distance = calculateLevenshteinDistance(a, b);
  // Calculate the maximum length of the two strings
  const maxLength = Math.max(a.length, b.length);
  return (1 - distance / maxLength) * 100; // Similaridade como porcentagem
}

// Function to calculate similarity between a text and a list of keywords
async function calculateKeywordSimilarity(text, keywords) {
  const cleanText = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ");

  const textWords = cleanText(text);

  return keywords.map((keyword) => {
    const keywordWords = cleanText(keyword);

    let totalSimilarity = 0;

    // Compare each word in the keyword with words in the text
    keywordWords.forEach((kwWord) => {
      let maxSimilarity = 0;
      textWords.forEach((textWord) => {
        const similarity = calculateStringSimilarity(kwWord, textWord);
        maxSimilarity = Math.max(maxSimilarity, similarity); // Similaridade máxima com uma palavra do texto
      });
      totalSimilarity += maxSimilarity; // Soma das similaridades
    });

    const averageSimilarity = totalSimilarity / keywordWords.length;

    return {
      keyword: keyword,
      averageSimilarity: averageSimilarity.toFixed(2), // Média de similaridade
    };
  });
}

async function getNumberOfKeywordsFound(text, keywords) {
  const results = await calculateKeywordSimilarity(text, keywords);

  let totalKeywordsFound = 0;
  for (const result of results) {
    if (result.averageSimilarity >= 60) {
      totalKeywordsFound++;
    }
  }

  return totalKeywordsFound;
}

async function evaluateKeywordScore(keywords, fullMarks, maxScore) {
  const text = getVar("UserInput");

  if (text === "") {
    return;
  }

  let _score = 0;
  const response = await getNumberOfKeywordsFound(text, keywords);

  if (response >= fullMarks) {
    _score = maxScore;
    setVar("score", getVar("score") + _score);
    setVar("isCorrect", true);
    return;
  }

  if (response <= fullMarks && response > 0) {
    _score = maxScore / 2;
    setVar("score", getVar("score") + _score);
    setVar("isPartiallyCorrect", true);
    return;
  }

  setVar("isIncorrect", true);
  return;
}

/*KEEP THIS
const keywords = [
  "Emissões nulas",
  "Eficiência energética",
  "Custos operacionais reduzidos",
  "eletricidade",
  "manutenção",
  "estacionamento",
];

textToCompareKeywords(keywords, 3, 6);

*/
