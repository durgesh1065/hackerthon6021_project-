// Define initial stats
let totalPatients = 0;
let admittedPatients = 0;
let availableBeds = 10; // You might want to set this dynamically
let averageWaitTime = '0 min';

// Define a global queue to keep track of patients
let queue = [];

// Update quick stats on the page
function updateQuickStats() {
    document.getElementById('total-patients').textContent = totalPatients;
    document.getElementById('total-admitted').textContent = admittedPatients;
    document.getElementById('available-beds').textContent = availableBeds;
    document.getElementById('average-wait-time').textContent = averageWaitTime;
}

// Update queue display
function updateQueueDisplay() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = '';
    
    queue.forEach((patient, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. Name: ${patient.name}, Department: ${patient.department}, Wait Time: ${patient.waitTime} min`;
        
        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', function() {
            removePatient(index);
        });
        listItem.appendChild(deleteButton);
        
        queueList.appendChild(listItem);
    });

    // Update queue count
    document.getElementById('patients-queue-count').textContent = queue.length;
}

// Remove patient from queue
function removePatient(index) {
    // Remove the patient from the queue
    queue.splice(index, 1);
    
    // Update queue display
    updateQueueDisplay();
    
    // Update stats
    totalPatients -= 1;
    availableBeds += 1;
    updateQuickStats();
}

// Handle check-in form submission
document.getElementById('checkin-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const patientName = document.getElementById('patient-name').value;
    const department = document.getElementById('department').value;

    // Calculate wait time based on queue length
    const waitTime = (queue.length + 1) * 5; // Assuming each patient adds 5 minutes

    // Add the patient to the queue
    queue.push({
        name: patientName,
        department: department,
        waitTime: waitTime
    });

    // Update stats
    totalPatients += 1;
    admittedPatients += 1;
    availableBeds -= 1;
    averageWaitTime = `${waitTime} min`;
    updateQuickStats();

    // Update queue display
    updateQueueDisplay();

    // Send the details to the server and log them to the terminal
    try {
        const response = await fetch('http://localhost:3000/admit-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: patientName,
                department: department,
                waitTime: waitTime
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log(`Patient admitted with ID: ${result.id}`);
        } else {
            console.error('Error admitting patient:', result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }

    // Reset the form
    document.getElementById('patient-name').value = '';
    document.getElementById('department').value = '';
});

// Initialize
updateQuickStats();
