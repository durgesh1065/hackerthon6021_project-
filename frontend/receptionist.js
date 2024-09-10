document.getElementById('receptionist-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const patientID = document.getElementById('patientID').value;
    const status = document.getElementById('patientStatus').value;

    console.log(`Patient ID: ${patientID}`);
    console.log(`Updated Status: ${status}`);
});
