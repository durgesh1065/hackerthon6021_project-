document.getElementById('patient-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const patientName = document.getElementById('patientName').value;
    const patientAge = document.getElementById('patientAge').value;
    const patientSymptoms = document.getElementById('patientSymptoms').value;
    const patientCritical = document.getElementById('patientCritical').checked; // Get checkbox state

    // Log the details (for example purposes)
    console.log('Patient Name:', patientName);
    console.log('Patient Age:', patientAge);
    console.log('Patient Symptoms:', patientSymptoms);
    console.log('Is the condition critical?', patientCritical ? 'Yes' : 'No');

    // Additional logic can be added here, such as submitting the data to a server
});
