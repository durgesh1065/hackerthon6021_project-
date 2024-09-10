// Function to handle inventory addition
async function addMedicineToInventory(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const medicineName = document.getElementById('medicine-name').value;
    const medicineStock = parseInt(document.getElementById('medicine-stock').value, 10);

    // Send the medicine details to the server to log it
    try {
        const response = await fetch('http://localhost:3000/log-medicine-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                medicine_name: medicineName,
                stock: medicineStock
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log(`Medicine ${medicineName} with stock ${medicineStock} logged successfully.`);
            
            // Redirect to Medicine Dispensation page with query parameters
            window.location.href = `medicine-dispensation.html?medicine=${encodeURIComponent(medicineName)}&stock=${medicineStock}`;
        } else {
            console.error('Error logging medicine:', result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the inventory form
    const inventoryForm = document.getElementById('inventory-form');
    inventoryForm.addEventListener('submit', addMedicineToInventory);
});
