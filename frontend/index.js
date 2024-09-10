// Retrieve patient queue from localStorage or initialize as empty array
let patientQueue = JSON.parse(localStorage.getItem('patientQueue')) || [];

// Generate a random ID
function generateRandomId() {
    return 'ID-' + Math.floor(Math.random() * 1000000);
}

// Handle form submission to generate patient ID and save to queue
document.getElementById('patient-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    
    const patientName = document.getElementById('patient-name').value;
    
    if (patientName) {
        const patientId = generateRandomId();
        document.getElementById('patient-id-display').textContent = 'Patient ID: ' + patientId;

        // Add patient to queue
        patientQueue.push({ name: patientName, id: patientId });
        updateQueueDisplay();
        
        // Save updated queue to localStorage
        localStorage.setItem('patientQueue', JSON.stringify(patientQueue));

        // Optionally log to console
        console.log('Patient Name:', patientName, 'Generated ID:', patientId); // For debugging
    }
});

// Handle patient deletion
function deletePatient(id) {
    // Filter out the patient with the given ID
    patientQueue = patientQueue.filter(patient => patient.id !== id);
    
    // Update the queue display
    updateQueueDisplay();
    
    // Save updated queue to localStorage
    localStorage.setItem('patientQueue', JSON.stringify(patientQueue));
}

// Update the queue display
function updateQueueDisplay() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = ''; // Clear existing list

    patientQueue.forEach(patient => {
        const listItem = document.createElement('li');
        listItem.textContent = `Name: ${patient.name}, ID: ${patient.id} `;

        // Create and append delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deletePatient(patient.id);
        };

        listItem.appendChild(deleteButton);
        queueList.appendChild(listItem);
    });
}

// Initial setup of bed grid and update queue display
function setupBeds() {
    // Your existing bed setup code
}

// Ensure queue is displayed on page load
updateQueueDisplay();
