document.getElementById('doctor-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const patientID = document.getElementById('patientID').value;
    const diagnosis = document.getElementById('diagnosis').value;

    console.log(`Patient ID: ${patientID}`);
    console.log(`Diagnosis: ${diagnosis}`);
});
