// Initialize variables
let queue = [];
let availableBeds = 10;
const totalBeds = 10;
let beds = new Array(totalBeds).fill(true); // true means the bed is available
let admittedPatients = [];

// Function to add a patient to the queue
function addPatientToQueue() {
    const name = document.getElementById('patient-name').value;
    if (!name) {
        alert('Please enter a patient name.');
        return;
    }

    // Add the patient to the queue list
    const queueList = document.getElementById('queue-list');
    const listItem = document.createElement('li');
    listItem.textContent = name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function() {
        removePatientFromQueue(queueList, name);
    };

    listItem.appendChild(deleteBtn);
    queueList.appendChild(listItem);
    document.getElementById('patient-name').value = ''; // Clear input

    // Send patient to the server
    fetch('http://localhost:3000/add-to-queue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })
    .then(response => response.ok ? console.log('Patient added to queue') : console.error('Failed to add patient to queue'))
    .catch(error => console.error('Error:', error));
}

// Function to remove a patient from the queue
function removePatientFromQueue(queueList, name) {
    queue = queue.filter(patient => patient !== name);
    updateQueueDisplay();

    // Remove the patient from the server
    fetch(`http://localhost:3000/delete-patient/${name}`, {
        method: 'DELETE'
    })
    .then(response => response.ok ? console.log('Patient removed from queue') : console.error('Failed to remove patient from queue'))
    .catch(error => console.error('Error:', error));
}

// Function to update the queue display
function updateQueueDisplay() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = '';
    queue.forEach((patient, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${patient}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            removePatientFromQueue(queueList, patient);
        };

        listItem.appendChild(deleteBtn);
        queueList.appendChild(listItem);
    });
}

// Function to set up the bed grid
function setupBeds() {
    const bedGrid = document.getElementById('bed-grid');
    bedGrid.innerHTML = '';
    beds.forEach((available, index) => {
        const bedDiv = document.createElement('div');
        bedDiv.textContent = index + 1;
        bedDiv.className = `bed ${available ? 'green' : 'red'}`;
        bedDiv.onclick = function() {
            if (available) {
                selectBed(index);
            } else {
                disallocateBed(index);
            }
        };
        bedGrid.appendChild(bedDiv);
    });
    updateNursePageData();
}

// Function to select a bed for a patient
function selectBed(bedNumber) {
    const patientName = prompt("Enter patient's name to book this bed:");
    if (patientName && patientName.trim() !== '') {
        beds[bedNumber] = false;
        admittedPatients.push({ name: patientName.trim(), bed: bedNumber + 1 });
        availableBeds--;
        document.getElementById('bed-status').textContent = `Available Beds: ${availableBeds}`;
        setupBeds();
        alert(`Bed ${bedNumber + 1} booked for ${patientName}`);

        // Send patient data to the server
        fetch('http://localhost:3000/add-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: patientName.trim(), bed_number: bedNumber + 1 })
        })
        .then(response => response.ok ? console.log('Patient admitted') : console.error('Failed to admit patient'))
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please enter a valid patient name.');
    }
}

// Function to disallocate a bed
function disallocateBed(bedNumber) {
    if (confirm(`Are you sure you want to disallocate Bed ${bedNumber + 1}?`)) {
        beds[bedNumber] = true;
        availableBeds++;
        document.getElementById('bed-status').textContent = `Available Beds: ${availableBeds}`;
        admittedPatients = admittedPatients.filter(patient => patient.bed !== bedNumber + 1);
        setupBeds();
        alert(`Bed ${bedNumber + 1} is now available again.`);

        // Remove patient data from the server
        fetch(`http://localhost:3000/delete-patient/${bedNumber + 1}`, {
            method: 'DELETE'
        })
        .then(response => response.ok ? console.log('Bed disallocated') : console.error('Failed to disallocate bed'))
        .catch(error => console.error('Error:', error));
    }
}

// Function to update the nurse page data
function updateNursePageData() {
    const bedData = JSON.stringify(beds);
    const admittedData = JSON.stringify(admittedPatients);
    localStorage.setItem('bedData', bedData);
    localStorage.setItem('admittedData', admittedData);
}

// Event listener to handle patient admission
document.getElementById('admission-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('admission-name').value.trim();
    const bedNumber = parseInt(document.getElementById('admission-bed').value, 10) - 1;

    if (name !== '' && bedNumber >= 0 && bedNumber < totalBeds && beds[bedNumber]) {
        beds[bedNumber] = false;
        availableBeds--;
        document.getElementById('bed-status').textContent = `Available Beds: ${availableBeds}`;
        admittedPatients.push({ name, bed: bedNumber + 1 });
        updateNursePageData();
        setupBeds();

        try {
            const response = await fetch('http://localhost:3000/add-patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, bed_number: bedNumber + 1 })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            console.log('Patient admitted:', data);
            alert('Patient admitted successfully');
        } catch (error) {
            console.error('Error admitting patient:', error);
        }
    } else {
        alert('Please select a valid bed number.');
    }
});

// Retrieve and display queue data on page load
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/get-queue')
    .then(response => response.json())
    .then(data => {
        queue = data.map(patient => patient.name);
        updateQueueDisplay();
    })
    .catch(error => console.error('Error fetching queue data:', error));
});
