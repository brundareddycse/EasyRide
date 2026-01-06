// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Booking form handling
    const bookingForm = document.querySelector('.booking-form');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const pickup = document.getElementById('pickup').value;
        const dropoff = document.getElementById('dropoff').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        
        if (!pickup || !dropoff) {
            alert('Please enter both pickup and drop locations');
            return;
        }
        
        
