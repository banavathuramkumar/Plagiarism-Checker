function tokenize(text) {
    const regex = /\w+|\W+/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        tokens.push(match[0]);
    }
    return tokens;
}

function getWordTokens(tokens) {
    return tokens
        .map((val, idx) => ({ val, idx }))
        .filter(t => /\w+/.test(t.val)); 
}

function computeLCS(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1].val.toLowerCase() === arr2[j - 1].val.toLowerCase()) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    let i = m, j = n;
    const matchIndices1 = new Set();
    const matchIndices2 = new Set();

    while (i > 0 && j > 0) {
        if (arr1[i - 1].val.toLowerCase() === arr2[j - 1].val.toLowerCase()) {
            matchIndices1.add(arr1[i - 1].idx);
            matchIndices2.add(arr2[j - 1].idx);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return { 
        lcsLength: dp[m][n], 
        matchIndices1: Array.from(matchIndices1), 
        matchIndices2: Array.from(matchIndices2) 
    };
}

function analyzeDocuments(text1, text2) {
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    const words1 = getWordTokens(tokens1);
    const words2 = getWordTokens(tokens2);

    const { lcsLength, matchIndices1, matchIndices2 } = computeLCS(words1, words2);

    const totalWords = words1.length + words2.length;
    let score = 0;
    if (totalWords > 0) {
        score = (2 * lcsLength) / totalWords;
    }
    const percentage = Math.round(score * 100);

    return {
        percentage,
        tokens1,
        tokens2,
        matchIndices1,
        matchIndices2
    };
}

module.exports = {
    analyzeDocuments
};
