// Function to generate a random number between 1 and max (inclusive)
function generateRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Define global variables
let IDQuestionNumber = generateRandomNumber(250); // Generate random number between 1 and 250
let currentQuestionCount = 0;
const totalQuestions = 5; // Total number of questions
let score = 0; // Initialize score to 0

// Function to generate random country IDs excluding specific IDs
function generateRandomCountryIds(numIds, excludeIds) {
    const randomIds = [];
    const maxCountryId = 250; // Assuming the maximum country ID available

    // Generate 'numIds' random unique country IDs excluding the provided excludeIds
    while (randomIds.length < numIds) {
        const randomId = Math.floor(Math.random() * maxCountryId) + 1; // Generate random ID between 1 and maxCountryId
        if (!randomIds.includes(randomId) && !excludeIds.includes(randomId)) {
            randomIds.push(randomId);
        }
    }

    return randomIds;
}

// Function to fetch and display question
async function fetchRegionQuestionAndDisplay() {
    const apiTemplate = `http://localhost/Quiz/API/template/3`; 
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

        // Update the question text in the HTML
        document.getElementById('question').innerText = questionText1 + ':' + ' ' + questionText2;

        // Reset styles and hide Next button
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.style.display = 'block'; // Ensure buttons are visible
        });
        document.getElementById('next-btn').style.display = 'none';

    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = 'What is the capital city of Slovenia?';
    }
}

// Function to fetch region data and display on buttons
async function fetchRegionAndDisplay(countryId, buttonElement, usedNames, isCorrectAnswer) {
    const apiUrl = `http://localhost/Quiz/API/country/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const regionName = data.region;

        // Check if the region name has already been used
        if (!usedNames.includes(regionName)) {
            // Update the button text to display the fetched region name
            buttonElement.textContent = regionName;
            usedNames.push(regionName); // Add the name to the used list
        } else {
            // If the name is already used and it's the correct answer, fetch another country ID
            if (isCorrectAnswer) {
                const newRegionId = generateRandomCountryIds(1, [countryId])[0];
                await fetchRegionAndDisplay(newRegionId, buttonElement, usedNames, true);
            } else {
                // For incorrect answers, use a different approach to find a unique region name
                let uniqueRegionName = await findUniqueRegionName(usedNames);
                buttonElement.textContent = uniqueRegionName;
                usedNames.push(uniqueRegionName);
            }
        }
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = 'Unknown'; // Default text in case of error
    }
}

// Function to find a unique region name not already in usedNames
async function findUniqueRegionName(usedNames) {
    const maxAttempts = 10; // Maximum attempts to find a unique region name
    let attempt = 0;

    while (attempt < maxAttempts) {
        const randomId = generateRandomNumber(250);
        const apiUrl = `http://localhost/Quiz/API/country/${randomId}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const regionName = data.region;

            if (!usedNames.includes(regionName)) {
                return regionName; // Return the unique region name
            }
        } catch (error) {
            console.error(`Error fetching country data for ID ${randomId}:`, error);
        }

        attempt++;
    }

    return 'Unknown'; // Fallback to 'Unknown' if no unique region name found
}

// Function to handle button click
function handleButtonClick(button, buttons) {
    if (button.id === IDQuestionNumber) {
        button.element.classList.add('correct');
        score++; // Increment score for correct answer
    } else {
        button.element.classList.add('incorrect');
        const correctButton = buttons.find(btn => btn.id === IDQuestionNumber);
        correctButton.element.classList.add('correct');
    }
    buttons.forEach(btn => btn.element.removeEventListener('click', btn.clickHandler));
    document.getElementById('next-btn').style.display = 'block'; // Show the Next button
}

// Function to fetch region data for all buttons upon page load
async function fetchAllRegionsAndDisplay() {
    const numButtons = 4; // Number of buttons to populate
    const buttons = [];

    const excludeIds = [IDQuestionNumber];
    const randomIds = generateRandomCountryIds(numButtons - 1, excludeIds);

    // Add the correct answer's ID to the randomIds array
    randomIds.push(IDQuestionNumber);

    // Shuffle the array to randomize button placement
    for (let i = randomIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomIds[i], randomIds[j]] = [randomIds[j], randomIds[i]];
    }

    // Assign buttons array with IDs and corresponding elements
    randomIds.forEach((id, index) => {
        buttons.push({
            id: id,
            element: document.getElementById(`button${index + 1}`)
        });
    });

    const usedNames = []; // Keep track of used region names

    // Fetch and display region names on buttons
    for (let button of buttons) {
        try {
            // Determine if this button is the correct answer
            const isCorrectAnswer = button.id === IDQuestionNumber;

            await fetchRegionAndDisplay(button.id, button.element, usedNames, isCorrectAnswer);
            button.clickHandler = () => handleButtonClick(button, buttons);
            button.element.addEventListener('click', button.clickHandler);
        } catch (error) {
            console.error(`Error fetching country ${button.id} data:`, error);
            button.element.textContent = 'Unknown'; // Default text in case of error
        }
    }
}

// Function to initialize a new question
async function initializeNewQuestion() {
    if (currentQuestionCount < totalQuestions) {
        IDQuestionNumber = generateRandomNumber(250);
        await fetchRegionQuestionAndDisplay();
        await fetchAllRegionsAndDisplay();
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
