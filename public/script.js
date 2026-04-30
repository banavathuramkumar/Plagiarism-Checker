document.addEventListener('DOMContentLoaded', () => {
    const doc1Input = document.getElementById('doc1-input');
    const doc2Input = document.getElementById('doc2-input');
    const doc1Filename = document.getElementById('doc1-filename');
    const doc2Filename = document.getElementById('doc2-filename');
    const compareBtn = document.getElementById('compare-btn');
    const resultsContainer = document.getElementById('results-container');
    const doc1Content = document.getElementById('doc1-content');
    const doc2Content = document.getElementById('doc2-content');
    const scoreText = document.getElementById('score-text');
    const scoreCircle = document.getElementById('score-circle');

    let file1Content = '';
    let file2Content = '';

    // Handle file selection
    doc1Input.addEventListener('change', (e) => handleFileSelect(e, 1));
    doc2Input.addEventListener('change', (e) => handleFileSelect(e, 2));

    function handleFileSelect(event, docNumber) {
        const file = event.target.files[0];
        if (!file) return;

        const filenameEl = docNumber === 1 ? doc1Filename : doc2Filename;
        const uploadEl = document.getElementById(`upload-doc${docNumber}`);
        
        filenameEl.textContent = file.name;
        uploadEl.classList.add('has-file');

        const reader = new FileReader();
        reader.onload = (e) => {
            if (docNumber === 1) {
                file1Content = e.target.result;
            } else {
                file2Content = e.target.result;
            }
            checkEnableCompare();
        };
        reader.readAsText(file);
    }

    function checkEnableCompare() {
        if (file1Content && file2Content) {
            compareBtn.disabled = false;
        } else {
            compareBtn.disabled = true;
        }
    }

    // Compare button click
    compareBtn.addEventListener('click', async () => {
        // Show loading state
        compareBtn.classList.add('loading');
        compareBtn.disabled = true;
        resultsContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text1: file1Content,
                    text2: file2Content
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            
            updateScoreUI(result.percentage);

            // Reconstruct the Set objects since they come back as Arrays from JSON
            const matchIndices1 = new Set(result.matchIndices1);
            const matchIndices2 = new Set(result.matchIndices2);

            doc1Content.innerHTML = highlightText(result.tokens1, matchIndices1);
            doc2Content.innerHTML = highlightText(result.tokens2, matchIndices2);
            
            resultsContainer.classList.remove('hidden');
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error comparing documents:', error);
            alert('An error occurred while comparing the documents.');
        } finally {
            compareBtn.classList.remove('loading');
            compareBtn.disabled = false;
        }
    });

    function highlightText(tokens, matchIndices) {
        return tokens.map((token, idx) => {
            const escaped = escapeHTML(token);
            if (matchIndices.has(idx)) {
                return `<span class="highlight-match">${escaped}</span>`;
            }
            return escaped;
        }).join('');
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    function updateScoreUI(percentage) {
        scoreText.textContent = `${percentage}%`;
        
        // The stroke-dasharray max is 100
        scoreCircle.style.strokeDasharray = `${percentage}, 100`;

        // Update color based on score
        scoreCircle.className.baseVal = 'circle'; // reset classes
        if (percentage < 30) {
            scoreCircle.classList.add('score-low');
        } else if (percentage < 70) {
            scoreCircle.classList.add('score-med');
        } else {
            scoreCircle.classList.add('score-high');
        }
    }
});
