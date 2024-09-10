// Function to save inventory to local storage
function saveInventoryToLocalStorage() {
    localStorage.setItem('medicineStock', JSON.stringify(medicineStock));
}

// Function to load inventory from local storage
function loadInventoryFromLocalStorage() {
    const savedStock = localStorage.getItem('medicineStock');
    if (savedStock) {
        Object.assign(medicineStock, JSON.parse(savedStock));
    }
}

// Initial medicine stock
const medicineStock = {
    "Paracetamol": 50,
    "Dolo": 30,
    "Aspirin": 20,
    "Ibuprofen": 15
};

// Function to update the displayed medicine stock
function updateMedicineList() {
    const medicineList = document.getElementById('medicine-list');
    medicineList.innerHTML = ''; // Clear existing list

    for (const [medicine, stock] of Object.entries(medicineStock)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${medicine}: ${stock} left`;
        medicineList.appendChild(listItem);
    }
}

// Function to handle medicine dispensing
async function dispenseMedicine(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const patientName = document.getElementById('dispense-patient-name').value;
    const medicineName = document.getElementById('medicine').value;

    if (medicineStock[medicineName] > 0) {
        medicineStock[medicineName] -= 1; // Decrease stock
        alert(`Medicine ${medicineName} dispensed to ${patientName}`);
        updateMedicineList(); // Update displayed stock
        saveInventoryToLocalStorage(); // Save changes to local storage

        // Send dispensation details to the server
        try {
            const response = await fetch('http://localhost:3000/dispense-medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_name: patientName, medicine_name: medicineName })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            if (data.success) {
                console.log(`Medicine dispensation logged with ID: ${data.id}`);
            } else {
                alert('Error logging medicine dispensation.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert(`Medicine ${medicineName} is out of stock`);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadInventoryFromLocalStorage(); // Load inventory from local storage
    updateMedicineList(); // Display initial stock

    // Add event listener to the form
    const dispenseForm = document.getElementById('dispense-form');
    dispenseForm.addEventListener('submit', dispenseMedicine);

    // Handle URL parameters to add medicine to stock
    const urlParams = new URLSearchParams(window.location.search);
    const medicineName = urlParams.get('medicine');
    const stock = parseInt(urlParams.get('stock'), 10);

    if (medicineName && stock) {
        if (medicineStock[medicineName]) {
            medicineStock[medicineName] += stock; // Increase existing stock
        } else {
            medicineStock[medicineName] = stock; // Add new medicine
        }
        console.log(`Medicine ${medicineName} added with stock ${stock}`);
        updateMedicineList(); // Update displayed stock
        saveInventoryToLocalStorage(); // Save changes to local storage
    }
});
