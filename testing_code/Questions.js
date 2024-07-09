// Define your named function
async function fetchQuestionAndDisplay() {
    const IDQuestionNumber = 1;
    const apiTemplate = `http://localhost/Quiz/API/template/${IDQuestionNumber}`; // Replace with your API endpoint
    const apiCountry = `http://localhost/Quiz/API/country/${IDQuestionNumber}`;
    try {
        const response1 = await fetch(apiTemplate);

        if (!response1.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse1 = await response1.json(); // Parse JSON response

        // Assuming jsonResponse is an array of questions or a single object with 'template' property
        let questionText1;
        if (Array.isArray(jsonResponse1)) {
            // If jsonResponse is an array, take the first element (assuming it contains the question object)
            questionText1 = jsonResponse1[0].template;
        } else {
            // If jsonResponse is a single object with 'template' property
            questionText1 = jsonResponse1.template;
        }



        const response2 = await fetch(apiCountry);

        if (!response2.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse2 = await response2.json(); // Parse JSON response

        // Assuming jsonResponse is an array of questions or a single object with 'template' property
        let questionText2;
        if (Array.isArray(jsonResponse2)) {
            // If jsonResponse is an array, take the first element (assuming it contains the question object)
            questionText2 = jsonResponse2[0].country;
        } else {
            // If jsonResponse is a single object with 'template' property
            questionText2 = jsonResponse2.country;
        }

        // Update the question text in the HTML
        document.getElementById('question').innerText = questionText1 + ' ' + questionText2 + '?';
    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = 'Error fetching question. Check console for details.';
    }
}

// Attach the named function to the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', fetchQuestionAndDisplay);