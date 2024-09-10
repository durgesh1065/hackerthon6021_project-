document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate username and password verification (Replace with actual authentication logic)
    if (password === 'password123') {
        if (username.endsWith('@doc')) {
            console.log('Doctor login successful!');
            window.location.href = 'doctor.html'; // Redirect to Doctor profile
        } else if (username.endsWith('@patient')) {
            console.log('Patient login successful!');
            window.location.href = 'patient.html'; // Redirect to Patient profile
        } else if (username.endsWith('@receptionist')) {
            console.log('Receptionist login successful!');
            window.location.href = 'receptionist.html'; // Redirect to Receptionist profile
        } else if (username.endsWith('@pharmacist')) {
            console.log('Pharmacist login successful!');
            window.location.href = 'pharmacy.html'; // Redirect to Pharmacist profile
        } else {
            alert('Invalid username format. Please try again.');
        }
    } else {
        alert('Invalid username or password. Please try again.');
    }
});
