document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('medicine-form');
    const descriptionDiv = document.getElementById('medicine-description');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting normally

        const medicineName = document.getElementById('medicine-name').value;

        try {
            const response = await fetch('http://localhost:3000/get-medicine-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ medicine_name: medicineName })
            });

            const result = await response.json();
            if (result.success) {
                descriptionDiv.textContent = result.description;
            } else {
                descriptionDiv.textContent = 'Error: ' + (result.error || 'Description not available.');
            }
        } catch (error) {
            console.error('Network error:', error);
            descriptionDiv.textContent = 'Network error occurred.';
        }
    });
});
