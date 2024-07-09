// Function to generate random country IDs
function generateRandomCountryIds(numIds) {
    const randomIds = [];
    const maxCountryId = 250; // Assuming the maximum country ID available

    // Generate 'numIds' random unique country IDs
    while (randomIds.length < numIds) {
        const randomId = Math.floor(Math.random() * maxCountryId) + 1; // Generate random ID between 1 and maxCountryId
        if (!randomIds.includes(randomId)) {
            randomIds.push(randomId);
        }
    }

    return randomIds;
}


// Function to fetch and display country data
async function fetchCountryAndDisplay(countryId, buttonElement) {
    const apiUrl = `http://localhost/Quiz/API/country/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Assuming 'data' contains the country name or relevant data
        const countryName = data.country;

        // Update the button text to display the fetched country name
        buttonElement.textContent = countryName;
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = 'Error'; // Update button text in case of error
    }
}

// Function to fetch country data for all buttons upon page load
async function fetchAllCountriesAndDisplay() {
    const numButtons = 4; // Number of buttons to populate
    const randomIds = generateRandomCountryIds(numButtons); // Generate random country IDs

    const buttons = randomIds.map((id, index) => ({
        id: id,
        element: document.getElementById(`button${index + 1}`)
    }));

    // Loop through each button and fetch country data
    for (let button of buttons) {
        try {
            await fetchCountryAndDisplay(button.id, button.element);
        } catch (error) {
            console.error(`Error fetching country ${button.id} data:`, error);
        }
    }
}

// Call fetchAllCountriesAndDisplay when DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchAllCountriesAndDisplay);
