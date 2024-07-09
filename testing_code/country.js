// Function to generate a random number between 1 and max (inclusive)
function generateRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Define global variables
let IDQuestionNumber = generateRandomNumber(250); // Generate random number between 1 and 250
let currentQuestionCount = 0;
const totalQuestions = 5; // Total number of questions
let score = 0; // Initialize score to 0

// Function to generate random country IDs
function generateRandomCountryIds(numIds, excludeId) {
    const randomIds = [];
    const maxCountryId = 250; // Assuming the maximum country ID available

    // Generate 'numIds' random unique country IDs excluding the provided excludeId
    while (randomIds.length < numIds) {
        const randomId = Math.floor(Math.random() * maxCountryId) + 1; // Generate random ID between 1 and maxCountryId
        if (!randomIds.includes(randomId) && randomId !== excludeId) {
            randomIds.push(randomId);
        }
    }

    return randomIds;
}

// Function to fetch and display question
async function fetchQuestionAndDisplay() {
    const apiTemplate = `http://localhost/Quiz/API/template/1`; // Replace with your API endpoint
    const apiCountry = `http://localhost/Quiz/API/country/${IDQuestionNumber}`;
    try {
        const response1 = await fetch(apiTemplate);

        if (!response1.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse1 = await response1.json(); // Parse JSON response

        let questionText1;
        if (Array.isArray(jsonResponse1)) {
            questionText1 = jsonResponse1[0].template;
        } else {
            questionText1 = jsonResponse1.template;
        }

        const response2 = await fetch(apiCountry);

        if (!response2.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse2 = await response2.json(); // Parse JSON response

        let questionText2;
        if (Array.isArray(jsonResponse2)) {
            questionText2 = jsonResponse2[0].country;
        } else {
            questionText2 = jsonResponse2.country;
        }

        const questionNumber = currentQuestionCount + 1; // Calculate question number
        // Update the question text in the HTML with the question number
        document.getElementById('question').innerText = `${questionNumber}. ${questionText1} ${questionText2}?`;

        // Reset styles and hide Next button
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.style.display = 'block'; // Ensure buttons are visible
        });
        document.getElementById('next-btn').style.display = 'none';

    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = `${currentQuestionCount + 1}. What is the capital city of Slovenia?`; // Default question text with number
    }
}

// Function to fetch country data and display on buttons
async function fetchCapitalAndDisplay(countryId, buttonElement) {
    const apiUrl = `http://localhost/Quiz/API/capital/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const countryName = data.capital_city;

        // Update the button text to display the fetched country name
        buttonElement.textContent = countryName;
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = 'Ljubljana'; // Default text in case of error
    }
}

// Function to handle button click
function handleButtonClick(button, buttons) {
    if (button.id === IDQuestionNumber) {
        button.element.classList.add('correct');
        score++; // Increment score for correct answer
        buttons.forEach(btn => btn.element.removeEventListener('click', btn.clickHandler));
        document.getElementById('next-btn').style.display = 'block'; // Show the Next button
    } else {
        button.element.classList.add('incorrect');
        const correctButton = buttons.find(btn => btn.id === IDQuestionNumber);
        correctButton.element.classList.add('correct');
        buttons.forEach(btn => btn.element.removeEventListener('click', btn.clickHandler));
        document.getElementById('next-btn').style.display = 'block'; // Show the Next button
    }
}

// Function to fetch country data for all buttons upon page load
async function fetchAllCapitalsAndDisplay() {
    const numButtons = 4; // Number of buttons to populate
    const buttons = [];

    const randomIds = generateRandomCountryIds(numButtons - 1, IDQuestionNumber);

    // Add the correct answer's ID
    randomIds.push(IDQuestionNumber);

    // Shuffle the array to randomize button placement
    for (let i = randomIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomIds[i], randomIds[j]] = [randomIds[j], randomIds[i]];
    }

    randomIds.forEach((id, index) => {
        buttons.push({
            id: id,
            element: document.getElementById(`button${index + 1}`)
        });
    });

    for (let button of buttons) {
        try {
            await fetchCapitalAndDisplay(button.id, button.element);
            button.clickHandler = () => handleButtonClick(button, buttons);
            button.element.addEventListener('click', button.clickHandler);
        } catch (error) {
            console.error(`Error fetching country ${button.id} data:`, error);
        }
    }
}

// Function to initialize a new question
async function initializeNewQuestion() {
    if (currentQuestionCount < totalQuestions) {
        IDQuestionNumber = generateRandomNumber(250);
        await fetchQuestionAndDisplay();
        await fetchAllCapitalsAndDisplay();
        currentQuestionCount++;
    } else {
        document.getElementById('question').innerText = `Quiz Completed! You scored ${score} out of ${totalQuestions} points.`;
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('play-again-btn').style.display = 'block'; // Show the Play Again button

        // Hide all buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => button.style.display = 'none');
    }
}

// Function to reset the quiz
function resetQuiz() {
    currentQuestionCount = 0;
    score = 0;
    document.getElementById('play-again-btn').style.display = 'none'; // Hide the Play Again button
    initializeNewQuestion(); // Start a new quiz
}

// Event listener for Next button click
document.getElementById('next-btn').addEventListener('click', initializeNewQuestion);

// Event listener for Play Again button click
document.getElementById('play-again-btn').addEventListener('click', resetQuiz);

// Event listener when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const nextButton = document.getElementById('next-btn');
    nextButton.style.display = 'none'; // Hide the Next button initially

    await initializeNewQuestion();
});