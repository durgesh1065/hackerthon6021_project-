document.addEventListener('DOMContentLoaded', function() {
    // Retrieve and display patient data
    fetch('http://localhost:3000/patients')
    .then(response => response.json())
    .then(data => {
        const bookedTableBody = document.querySelector('#booked-bed-table tbody');
        const unbookedTableBody = document.querySelector('#unbooked-bed-table tbody');

        // Clear existing rows
        bookedTableBody.innerHTML = '';
        unbookedTableBody.innerHTML = '';

        // Categorize and add data to tables
        data.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.bed_number}</td>
                <td><button class="delete-btn" onclick="deletePatient(${patient.id})">Delete</button></td>
            `;

            // Append to appropriate table
            if (patient.bed_number) {
                bookedTableBody.appendChild(row);
            } else {
                unbookedTableBody.appendChild(row);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching patient data:', error);
    });

    // Retrieve and display queue data
    fetch('http://localhost:3000/get-queue')
    .then(response => response.json())
    .then(data => {
        const queueList = document.getElementById('queue-list');
        queueList.innerHTML = '';
        data.forEach((patient, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${patient.name}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = function() {
                deleteQueuePatient(patient.name);
            };

            listItem.appendChild(deleteBtn);
            queueList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching queue data:', error));
});

// Function to delete a patient from the queue
function deleteQueuePatient(name) {
    fetch(`http://localhost:3000/delete-from-queue/${name}`, {
        method: 'DELETE'
    })
    .then(response => response.ok ? console.log('Patient removed from queue') : console.error('Failed to remove patient from queue'))
    .then(() => {
        // Notify the main page
        return fetch('http://localhost:3000/notify-main-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, action: 'delete' })
        });
    })
    .then(() => {
        // Remove from DOM and reload
        const queueList = document.getElementById('queue-list');
        queueList.innerHTML = ''; // Clear list and reload
        return fetch('http://localhost:3000/get-queue');
    })
    .then(response => response.json())
    .then(data => {
        const queueList = document.getElementById('queue-list');
        data.forEach((patient, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${patient.name}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = function() {
                deleteQueuePatient(patient.name);
            };

            listItem.appendChild(deleteBtn);
            queueList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete a patient
function deletePatient(id) {
    fetch(`http://localhost:3000/delete-patient/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.ok ? console.log('Patient deleted') : console.error('Failed to delete patient'))
    .then(() => {
        // Notify the main page
        return fetch('http://localhost:3000/notify-main-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, action: 'delete' })
        });
    })
    .catch(error => console.error('Error:', error));
}
