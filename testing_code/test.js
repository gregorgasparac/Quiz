// Function to fetch country data and display on buttons
async function fetchCapitalAndDisplay(countryId, buttonElement, usedNames) {
    const apiUrl = `http://localhost/Quiz/API/country/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const countryName = data.region;

        // Check if the country name has already been used
        if (!usedNames.includes(countryName)) {
            // Update the button text to display the fetched country name
            buttonElement.textContent = countryName;
            usedNames.push(countryName); // Add the name to the used list
        } else {
            // Fetch another country ID if name is already used
            const newCountryId = generateRandomCountryIds(1, [countryId])[0];
            fetchCapitalAndDisplay(newCountryId, buttonElement, usedNames);
        }
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = ' '; // Default text in case of error
    }
}

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

document.addEventListener('DOMContentLoaded', async () => {
  const buttons = [
    document.getElementById('button1'),
    document.getElementById('button2'),
    document.getElementById('button3'),
    document.getElementById('button4')
  ];

  // Generate 4 random country IDs
  const randomCountryIds = generateRandomCountryIds(4, []);
  const usedNames = []; // Keep track of used country names

  buttons.forEach((button, index) => {
    fetchCapitalAndDisplay(randomCountryIds[index], button, usedNames);
  });
});
