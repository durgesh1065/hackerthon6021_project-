// Initialize variables
const totalBeds = 10;
let occupiedBeds = 0;
let availableBeds = totalBeds;
let admittedPatients = [];

// Function to update the bed stats display
function updateBedStats() {
    document.getElementById('occupied-beds').textContent = occupiedBeds;
    document.getElementById('available-beds').textContent = availableBeds;
}

// Function to create and update the bed grid
function setupBedGrid() {
    const bedGrid = document.getElementById('bed-grid');
    const availableBedSelect = document.getElementById('available-bed');
    bedGrid.innerHTML = '';
    availableBedSelect.innerHTML = ''; // Clear previous options
    
    for (let i = 1; i <= totalBeds; i++) {
        const bedDiv = document.createElement('div');
        bedDiv.className = 'bed';
        bedDiv.textContent = `${i}`;
        bedDiv.setAttribute('data-room-number', i);
        
        // Check if the bed is occupied
        const patient = admittedPatients.find(p => p.bed === i);
        if (patient) {
            bedDiv.classList.add('red');
            bedDiv.innerHTML += `<div class="patient-info">${patient.name}</div>`;
            bedDiv.innerHTML += `<button class="delete-btn" onclick="removePatient(${admittedPatients.indexOf(patient)})">X</button>`;
        } else {
            bedDiv.classList.add('green');
            bedDiv.onclick = function() {
                selectBed(i);
            };
        }
        
        bedGrid.appendChild(bedDiv);
        
        // Add option to select element
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Bed ${i}`;
        availableBedSelect.appendChild(option);
    }
}

// Function to handle bed selection
function selectBed(bedNumber) {
    const patientName = prompt("Enter patient's name to book this bed:");
    if (patientName && patientName.trim() !== '') {
        // Update global state
        admittedPatients.push({ name: patientName.trim(), bed: bedNumber });
        occupiedBeds++;
        availableBeds--;
        
        // Update the display
        updateBedStats();
        setupBedGrid();
        
        alert(`Room ${bedNumber} booked for ${patientName}`);
    } else {
        alert('Please enter a valid patient name.');
    }
}

// Function to handle patient removal
function removePatient(index) {
    const patient = admittedPatients[index];
    
    if (confirm(`Are you sure you want to remove ${patient.name}?`)) {
        // Remove the patient from the global state
        admittedPatients.splice(index, 1);
        occupiedBeds--;
        availableBeds++;
        
        // Update the display
        updateBedStats();
        setupBedGrid();
    }
}

// Function to handle patient admission
async function admitPatient(event) {
    event.preventDefault();
    
    const patientName = document.getElementById('admit-patient-name').value.trim();
    const department = document.getElementById('admit-department').value.trim();
    const bedNumber = parseInt(document.getElementById('available-bed').value, 10);
    
    if (availableBeds > 0 && patientName && department && bedNumber) {
        // Update global state
        admittedPatients.push({ name: patientName, bed: bedNumber });
        occupiedBeds++;
        availableBeds--;
        
        // Update display
        updateBedStats();
        setupBedGrid();
        
        // Clear the form
        document.getElementById('admit-form').reset();
        
        // Send the data to the server
        try {
            const response = await fetch('http://localhost:3000/admit-patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: patientName, department, bed_number: bedNumber })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            if (data.success) {
                alert(`Patient ${patientName} admitted successfully.`);
            } else {
                alert('Error admitting patient.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('Please fill in all fields and select an available bed.');
    }
}

// Add event listener to the form
document.getElementById('admit-form').addEventListener('submit', admitPatient);

// Function to fetch and update bed availability
function updateBedAvailability() {
    fetch('http://localhost:3000/bed-availability')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-beds').textContent = data.totalBeds;
            document.getElementById('occupied-beds').textContent = data.occupiedBeds;
            document.getElementById('available-beds').textContent = data.availableBeds;
            
            // Populate available beds
            const availableBedSelect = document.getElementById('available-bed');
            availableBedSelect.innerHTML = '';
            data.availableBedsList.forEach(bed => {
                const option = document.createElement('option');
                option.value = bed;
                option.textContent = bed;
                availableBedSelect.appendChild(option);
            });
            
            // Populate admitted patients
            const admittedPatientsList = document.getElementById('admitted-patients');
            admittedPatientsList.innerHTML = '';
            data.admittedPatients.forEach(patient => {
                const listItem = document.createElement('li');
                listItem.textContent = `${patient.name} - ${patient.department} - Bed ${patient.bed}`;
                admittedPatientsList.appendChild(listItem);
            });
        });
}

// Initial update on page load
document.addEventListener('DOMContentLoaded', function() {
    setupBedGrid();
    updateBedStats();
    updateBedAvailability();
});
