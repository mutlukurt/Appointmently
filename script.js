// Appointmently - Main JavaScript File

// Global variables
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let currentStep = 'services';
let appointments = JSON.parse(localStorage.getItem('appointmently_appointments') || '[]');

// Service images configuration (for site administrators)
const serviceImages = {
    'haircut': {
        default: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2500&q=100',
        gallery: []
    },
    'hair-coloring': {
        default: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2500&q=100',
        gallery: []
    },
    'styling': {
        default: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2500&q=100',
        gallery: []
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadAppointmentHistory();
});

function initializeApp() {
    // Add event listeners
    addServiceCardListeners();
    addNavigationListeners();
    addModalListeners();
    addFormListeners();
    addSmoothScrolling();
    addMobileMenuListeners();
    
    // Initialize calendar
    initializeCalendar();
    
    // Generate time slots
    generateTimeSlots();
    
    // Initialize service images
    initializeServiceImages();
    
    // Add keyboard navigation
    addKeyboardNavigation();
    
    // Initialize progress indicator
    initializeProgressIndicator();

    // Enhanced responsive design functionality
    addResponsiveDesignFeatures();
}

// Service image management
function initializeServiceImages() {
    // Load saved images from localStorage (for site administrators)
    const savedImages = localStorage.getItem('appointmently_service_images');
    if (savedImages) {
        try {
            const parsed = JSON.parse(savedImages);
            Object.assign(serviceImages, parsed);
        } catch (e) {
            console.error('Error loading saved service images:', e);
        }
    }
    
    // Update all service images
    updateServiceImages();
}

function updateServiceImages() {
    // Update service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const serviceType = card.dataset.service;
        const imageContainer = card.querySelector('.service-image');
        if (imageContainer && serviceImages[serviceType]) {
            const currentImage = serviceImages[serviceType].gallery.length > 0 
                ? serviceImages[serviceType].gallery[0] 
                : serviceImages[serviceType].default;
            imageContainer.src = currentImage;
        }
    });
    
    // Update service table
    const serviceTableRows = document.querySelectorAll('tbody tr');
    serviceTableRows.forEach(row => {
        const serviceName = row.querySelector('span').textContent.toLowerCase();
        const serviceType = getServiceTypeFromName(serviceName);
        const imageContainer = row.querySelector('img');
        if (imageContainer && serviceImages[serviceType]) {
            const currentImage = serviceImages[serviceType].gallery.length > 0 
                ? serviceImages[serviceType].gallery[0] 
                : serviceImages[serviceType].default;
            imageContainer.src = currentImage;
        }
    });
}

function getServiceTypeFromName(name) {
    const nameMap = {
        'haircut': 'haircut',
        'hair coloring': 'hair-coloring',
        'styling & care': 'styling'
    };
    return nameMap[name] || 'haircut';
}

// Function for site administrators to add images
function addServiceImage(serviceType, imageUrl) {
    if (serviceImages[serviceType]) {
        serviceImages[serviceType].gallery.push(imageUrl);
        localStorage.setItem('appointmently_service_images', JSON.stringify(serviceImages));
        updateServiceImages();
    }
}

// Function for site administrators to remove images
function removeServiceImage(serviceType, imageIndex) {
    if (serviceImages[serviceType] && serviceImages[serviceType].gallery[imageIndex]) {
        serviceImages[serviceType].gallery.splice(imageIndex, 1);
        localStorage.setItem('appointmently_service_images', JSON.stringify(serviceImages));
        updateServiceImages();
    }
}

// Service selection functionality
function addServiceCardListeners() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            serviceCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to current card
            this.classList.add('selected');
            
            // Store selected service data
            selectedService = {
                name: this.querySelector('h3').textContent,
                price: parseInt(this.dataset.price),
                service: this.dataset.service,
                duration: this.querySelector('.text-sm').textContent.trim()
            };
            
            // Animate transition to date selection
            setTimeout(() => {
                showDateSelection();
            }, 300);
        });
    });
}

// Date selection functionality
function showDateSelection() {
    const serviceSelection = document.getElementById('service-selection');
    const dateSelection = document.getElementById('date-selection');
    
    // Update current step
    currentStep = 'dates';
    updateProgressIndicator();
    
    // Hide service selection with animation
    serviceSelection.classList.add('animate__fadeOutLeft');
    setTimeout(() => {
        serviceSelection.classList.add('hidden');
        serviceSelection.classList.remove('animate__fadeOutLeft');
        
        // Show date selection with animation
        dateSelection.classList.remove('hidden');
        dateSelection.classList.add('animate__fadeInRight');
        
        // Initialize calendar
        renderCalendar();
    }, 300);
}

function initializeCalendar() {
    // Calendar will be rendered when needed
}

// Enhanced calendar rendering for mobile
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    const { DateTime } = luxon;
    const now = DateTime.now();
    const currentMonth = now.startOf('month');
    const daysInMonth = currentMonth.daysInMonth;
    const firstDayOfMonth = currentMonth.weekday;
    
    let calendarHTML = '';
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="text-center text-xs sm:text-sm font-semibold text-gray-500 py-2">${day}</div>`;
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < firstDayOfMonth; i++) {
        calendarHTML += '<div class="calendar-day disabled"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = currentMonth.set({ day: day });
        const isToday = date.hasSame(now, 'day');
        const isPast = date < now.startOf('day');
        const isSelected = selectedDate && date.hasSame(selectedDate, 'day');
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isPast) classes += ' disabled';
        if (isSelected) classes += ' selected';
        
        calendarHTML += `<div class="${classes}" data-date="${date.toISO()}">${day}</div>`;
    }
    
    calendar.innerHTML = calendarHTML;
    
    // Add event listeners to calendar days
    const calendarDays = calendar.querySelectorAll('.calendar-day:not(.disabled)');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            const dateString = this.dataset.date;
            selectedDate = DateTime.fromISO(dateString);
            
            // Remove previous selection
            calendar.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            
            // Add selection to clicked day
            this.classList.add('selected');
            
            // Show time selection after a short delay
            setTimeout(() => {
                showTimeSelection();
            }, 300);
        });
    });
}

// Time selection functionality
function showTimeSelection() {
    const dateSelection = document.getElementById('date-selection');
    const timeSelection = document.getElementById('time-selection');
    
    // Update current step
    currentStep = 'times';
    updateProgressIndicator();
    
    // Hide date selection with animation
    dateSelection.classList.add('animate__fadeOutLeft');
    setTimeout(() => {
        dateSelection.classList.add('hidden');
        dateSelection.classList.remove('animate__fadeOutLeft');
        
        // Show time selection with animation
        timeSelection.classList.remove('hidden');
        timeSelection.classList.add('animate__fadeInRight');
        
        // Generate time slots for selected date
        generateTimeSlots();
    }, 300);
}

// Enhanced time slot generation for mobile
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (!timeSlotsContainer) return;
    
    const startHour = 9;
    const endHour = 19;
    const interval = 30;
    
    let timeSlotsHTML = '';
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isSelected = selectedTime === time;
            
            let classes = 'time-slot';
            if (isSelected) classes += ' selected';
            
            timeSlotsHTML += `<div class="${classes}" data-time="${time}">${time}</div>`;
        }
    }
    
    timeSlotsContainer.innerHTML = timeSlotsHTML;
    
    // Add event listeners to time slots
    const timeSlots = timeSlotsContainer.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            const time = this.dataset.time;
            selectedTime = time;
            
            // Remove previous selection
            timeSlotsContainer.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            
            // Add selection to clicked slot
            this.classList.add('selected');
            
            // Show confirmation after a short delay
            setTimeout(() => {
                showConfirmation();
            }, 300);
        });
    });
}

// Confirmation functionality
function showConfirmation() {
    const timeSelection = document.getElementById('time-selection');
    const confirmation = document.getElementById('confirmation');
    
    // Update current step
    currentStep = 'confirmation';
    updateProgressIndicator();
    
    // Hide time selection with animation
    timeSelection.classList.add('animate__fadeOutLeft');
    setTimeout(() => {
        timeSelection.classList.add('hidden');
        timeSelection.classList.remove('animate__fadeOutLeft');
        
        // Show confirmation with animation
        confirmation.classList.remove('hidden');
        confirmation.classList.add('animate__fadeInRight');
        
        // Populate appointment summary
        populateAppointmentSummary();
    }, 300);
}

function populateAppointmentSummary() {
    const summaryContainer = document.getElementById('appointment-summary');
    const totalPriceElement = document.getElementById('total-price');
    
    // Clear previous summary
    summaryContainer.innerHTML = '';
    
    // Add service summary
    const serviceSummary = document.createElement('div');
    serviceSummary.className = 'summary-item';
    serviceSummary.innerHTML = `
        <div>
            <h4 class="font-semibold text-[#1E1E2F]">${selectedService.name}</h4>
            <p class="text-sm text-gray-600">${selectedService.duration}</p>
        </div>
        <span class="font-bold text-[#5C6AC4]">$${selectedService.price}</span>
    `;
    summaryContainer.appendChild(serviceSummary);
    
    // Add date summary
    const dateSummary = document.createElement('div');
    dateSummary.className = 'summary-item';
    dateSummary.innerHTML = `
        <div>
            <h4 class="font-semibold text-[#1E1E2F]">Date</h4>
            <p class="text-sm text-gray-600">${selectedDate.toFormat('EEEE, MMMM d, yyyy')}</p>
        </div>
        <span class="text-[#5C6AC4]">${selectedDate.toFormat('MMM d')}</span>
    `;
    summaryContainer.appendChild(dateSummary);
    
    // Add time summary
    const timeSummary = document.createElement('div');
    timeSummary.className = 'summary-item';
    timeSummary.innerHTML = `
        <div>
            <h4 class="font-semibold text-[#1E1E2F]">Time</h4>
            <p class="text-sm text-gray-600">${selectedTime}</p>
        </div>
        <span class="text-[#5C6AC4]">${selectedTime}</span>
    `;
    summaryContainer.appendChild(timeSummary);
    
    // Set total price
    totalPriceElement.textContent = `$${selectedService.price}`;
}

// Navigation functionality
function addNavigationListeners() {
    // Back to services button
    document.getElementById('back-to-services').addEventListener('click', function() {
        goBackToServices();
    });
    
    // Back to dates button
    document.getElementById('back-to-dates').addEventListener('click', function() {
        goBackToDates();
    });
    
    // Back to times button
    document.getElementById('back-to-times').addEventListener('click', function() {
        goBackToTimes();
    });
    
    // Confirm appointment button
    document.getElementById('confirm-appointment').addEventListener('click', function() {
        confirmAppointment();
    });
}

function goBackToServices() {
    const dateSelection = document.getElementById('date-selection');
    const serviceSelection = document.getElementById('service-selection');
    
    // Update current step
    currentStep = 'services';
    updateProgressIndicator();
    
    dateSelection.classList.add('animate__fadeOutRight');
    setTimeout(() => {
        dateSelection.classList.add('hidden');
        dateSelection.classList.remove('animate__fadeOutRight');
        
        serviceSelection.classList.remove('hidden');
        serviceSelection.classList.add('animate__fadeInLeft');
        
        // Clear selections
        selectedService = null;
        selectedDate = null;
        selectedTime = null;
        
        // Remove selections from UI
        document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    }, 300);
}

function goBackToDates() {
    const timeSelection = document.getElementById('time-selection');
    const dateSelection = document.getElementById('date-selection');
    
    // Update current step
    currentStep = 'dates';
    updateProgressIndicator();
    
    timeSelection.classList.add('animate__fadeOutRight');
    setTimeout(() => {
        timeSelection.classList.add('hidden');
        timeSelection.classList.remove('animate__fadeOutRight');
        
        dateSelection.classList.remove('hidden');
        dateSelection.classList.add('animate__fadeInLeft');
        
        // Clear time selection
        selectedTime = null;
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    }, 300);
}

function goBackToTimes() {
    const confirmation = document.getElementById('confirmation');
    const timeSelection = document.getElementById('time-selection');
    
    // Update current step
    currentStep = 'times';
    updateProgressIndicator();
    
    confirmation.classList.add('animate__fadeOutRight');
    setTimeout(() => {
        confirmation.classList.add('hidden');
        confirmation.classList.remove('animate__fadeOutRight');
        
        timeSelection.classList.remove('hidden');
        timeSelection.classList.add('animate__fadeInLeft');
        
        // Clear time selection
        selectedTime = null;
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    }, 300);
}

// Modal functionality
function addModalListeners() {
    const closeModal = document.getElementById('close-modal');
    const successModal = document.getElementById('success-modal');
    
    closeModal.addEventListener('click', function() {
        hideSuccessModal();
    });
    
    // Close modal when clicking outside
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });
}

function showSuccessModal() {
    try {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('animate__zoomIn');
        } else {
            console.error('Success modal not found');
            // Fallback: show success message instead
            showSuccess('Appointment confirmed successfully!');
        }
    } catch (error) {
        console.error('Error showing success modal:', error);
        // Fallback: show success message instead
        showSuccess('Appointment confirmed successfully!');
    }
}

function hideSuccessModal() {
    try {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('animate__zoomOut');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('animate__zoomOut');
                
                // Reset to services
                resetToServices();
            }, 300);
        } else {
            console.error('Success modal not found');
            // Fallback: reset to services directly
            resetToServices();
        }
    } catch (error) {
        console.error('Error hiding success modal:', error);
        // Fallback: reset to services directly
        resetToServices();
    }
}

function confirmAppointment() {
    // Validate all selections
    if (!selectedService || !selectedDate || !selectedTime) {
        showError('Please complete all selections before confirming.');
        return;
    }
    
    // Show loading state
    const confirmButton = document.getElementById('confirm-appointment');
    const originalText = confirmButton.textContent;
    confirmButton.innerHTML = '<span class="loading"></span> Confirming...';
    confirmButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        try {
            // Convert selectedDate to ISO string properly
            let dateString;
            if (typeof selectedDate.toISOString === 'function') {
                dateString = selectedDate.toISOString();
            } else if (typeof selectedDate.toISO === 'function') {
                // For Luxon DateTime objects
                dateString = selectedDate.toISO();
            } else {
                // Fallback for other date formats
                dateString = new Date(selectedDate).toISOString();
            }
            
            // Save appointment to localStorage
            const appointmentData = {
                service: selectedService,
                date: dateString,
                time: selectedTime,
                totalPrice: selectedService.price
            };
            
            const savedAppointment = saveAppointment(appointmentData);
            
            // Show success modal
            showSuccessModal();
            
            // Reset button
            confirmButton.textContent = originalText;
            confirmButton.disabled = false;
            
            // Refresh appointment history
            loadAppointmentHistory();
            
            // Log appointment for debugging
            console.log('Appointment saved:', savedAppointment);
            
        } catch (error) {
            console.error('Error saving appointment:', error);
            showError('Failed to save appointment. Please try again.');
            confirmButton.textContent = originalText;
            confirmButton.disabled = false;
        }
    }, 2000);
}

function resetToServices() {
    try {
        // Hide all sections
        const dateSelection = document.getElementById('date-selection');
        const timeSelection = document.getElementById('time-selection');
        const confirmation = document.getElementById('confirmation');
        
        if (dateSelection) dateSelection.classList.add('hidden');
        if (timeSelection) timeSelection.classList.add('hidden');
        if (confirmation) confirmation.classList.add('hidden');
        
        // Show services
        const serviceSelection = document.getElementById('service-selection');
        if (serviceSelection) {
            serviceSelection.classList.remove('hidden');
            serviceSelection.classList.add('animate__fadeIn');
        }
        
        // Clear all selections
        selectedService = null;
        selectedDate = null;
        selectedTime = null;
        
        // Remove selections from UI
        document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        
        // Update progress indicator
        currentStep = 'services';
        updateProgressIndicator();
    } catch (error) {
        console.error('Error resetting to services:', error);
    }
}

// Form handling
function addFormListeners() {
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }
}

function handleContactForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
        showError('Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<span class="loading"></span> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        try {
            // Show success message
            showSuccess('Your message has been sent successfully! We will get back to you soon.');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
        } catch (error) {
            console.error('Error sending message:', error);
            showError('Failed to send message. Please try again.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }, 2000);
}

// Smooth scrolling
function addSmoothScrolling() {
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for sticky header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility functions
function formatDate(date) {
    if (typeof luxon !== 'undefined' && date) {
        return date.toFormat('EEEE, MMMM d, yyyy');
    }
    return date;
}

function formatTime(time) {
    return time;
}

// Keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key to go back
        if (e.key === 'Escape') {
            handleEscapeKey();
        }
        
        // Enter key to proceed
        if (e.key === 'Enter' && e.target.classList.contains('service-card')) {
            e.target.click();
        }
        
        // Arrow keys for navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleArrowKeys(e.key);
        }
    });
}

function handleEscapeKey() {
    switch(currentStep) {
        case 'dates':
            goBackToServices();
            break;
        case 'times':
            goBackToDates();
            break;
        case 'confirmation':
            goBackToTimes();
            break;
    }
}

function handleArrowKeys(key) {
    if (currentStep === 'services') {
        const serviceCards = document.querySelectorAll('.service-card');
        const currentIndex = Array.from(serviceCards).findIndex(card => card.classList.contains('selected'));
        
        if (key === 'ArrowRight' && currentIndex < serviceCards.length - 1) {
            serviceCards[currentIndex + 1].click();
        } else if (key === 'ArrowLeft' && currentIndex > 0) {
            serviceCards[currentIndex - 1].click();
        }
    }
}

// Progress indicator
function initializeProgressIndicator() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'progress-indicator';
    progressContainer.className = 'fixed top-0 left-0 w-full h-1 bg-gray-200 z-50';
    progressContainer.innerHTML = '<div id="progress-bar" class="h-full bg-[#5C6AC4] transition-all duration-300" style="width: 25%"></div>';
    
    document.body.appendChild(progressContainer);
    updateProgressIndicator();
}

function updateProgressIndicator() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    let progress = 25; // Default for services
    
    switch(currentStep) {
        case 'services':
            progress = 25;
            break;
        case 'dates':
            progress = 50;
            break;
        case 'times':
            progress = 75;
            break;
        case 'confirmation':
            progress = 100;
            break;
    }
    
    progressBar.style.width = `${progress}%`;
}

// Enhanced appointment management
function saveAppointment(appointmentData) {
    try {
        const appointment = {
            id: Date.now(),
            ...appointmentData,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };
        
        appointments.push(appointment);
        localStorage.setItem('appointmently_appointments', JSON.stringify(appointments));
        
        return appointment;
    } catch (error) {
        console.error('Error saving appointment:', error);
        throw error;
    }
}

function getAppointments() {
    try {
        return appointments || [];
    } catch (error) {
        console.error('Error getting appointments:', error);
        return [];
    }
}

function cancelAppointment(appointmentId) {
    try {
        appointments = appointments.filter(app => app.id !== appointmentId);
        localStorage.setItem('appointmently_appointments', JSON.stringify(appointments));
        loadAppointmentHistory(); // Refresh the display
    } catch (error) {
        console.error('Error canceling appointment:', error);
        showError('Failed to cancel appointment. Please try again.');
    }
}

// Load and display appointment history
function loadAppointmentHistory() {
    try {
        const noAppointments = document.getElementById('no-appointments');
        const appointmentsList = document.getElementById('appointments-list');
        
        if (!noAppointments || !appointmentsList) {
            console.log('Appointment history elements not found');
            return;
        }
        
        const appointments = getAppointments();
        
        if (appointments.length === 0) {
            noAppointments.classList.remove('hidden');
            appointmentsList.classList.add('hidden');
            return;
        }
        
        noAppointments.classList.add('hidden');
        appointmentsList.classList.remove('hidden');
        
        // Clear existing appointments
        appointmentsList.innerHTML = '';
        
        // Sort appointments by date (newest first)
        const sortedAppointments = appointments.sort((a, b) => {
            try {
                return new Date(b.date) - new Date(a.date);
            } catch (error) {
                console.error('Error sorting appointments:', error);
                return 0;
            }
        });
        
        sortedAppointments.forEach(appointment => {
            try {
                const appointmentElement = createAppointmentElement(appointment);
                appointmentsList.appendChild(appointmentElement);
            } catch (error) {
                console.error('Error creating appointment element:', error);
            }
        });
    } catch (error) {
        console.error('Error loading appointment history:', error);
    }
}

function createAppointmentElement(appointment) {
    try {
        const { DateTime } = luxon;
        const appointmentDate = DateTime.fromISO(appointment.date);
        const isPast = appointmentDate < DateTime.now();
        
        const appointmentElement = document.createElement('div');
        appointmentElement.className = `appointment-item bg-gray-50 rounded-lg p-4 border border-gray-200 ${isPast ? 'opacity-75' : ''}`;
        
        appointmentElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h4 class="text-lg font-semibold text-[#1E1E2F]">${appointment.service.name || 'Unknown Service'}</h4>
                        <span class="ml-2 px-2 py-1 text-xs rounded-full ${isPast ? 'bg-gray-300 text-gray-600' : 'bg-green-100 text-green-800'}">
                            ${isPast ? 'Completed' : 'Upcoming'}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                        <div class="flex items-center">
                            <img src="https://cdn-icons-png.flaticon.com/512/2972/2972543.png" alt="Date" class="w-4 h-4 mr-2">
                            ${appointmentDate.isValid ? appointmentDate.toFormat('EEEE, MMMM d, yyyy') : 'Invalid Date'}
                        </div>
                        <div class="flex items-center">
                            <img src="https://cdn-icons-png.flaticon.com/512/2972/2972543.png" alt="Time" class="w-4 h-4 mr-2">
                            ${appointment.time || 'No time specified'}
                        </div>
                        <div class="flex items-center">
                            <img src="https://cdn-icons-png.flaticon.com/512/2972/2972543.png" alt="Duration" class="w-4 h-4 mr-2">
                            ${appointment.service.duration || 'Duration not specified'}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xl font-bold text-[#5C6AC4]">$${appointment.totalPrice || appointment.service.price || 0}</div>
                    ${!isPast ? `
                        <button onclick="cancelAppointment(${appointment.id})" class="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        return appointmentElement;
    } catch (error) {
        console.error('Error creating appointment element:', error);
        
        // Return a fallback element if there's an error
        const fallbackElement = document.createElement('div');
        fallbackElement.className = 'appointment-item bg-gray-50 rounded-lg p-4 border border-gray-200';
        fallbackElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="text-lg font-semibold text-[#1E1E2F]">Appointment</h4>
                    <p class="text-sm text-gray-600">Error loading appointment details</p>
                </div>
                <div class="text-right">
                    <button onclick="cancelAppointment(${appointment.id})" class="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        return fallbackElement;
    }
}

// Enhanced error handling
function showError(message, duration = 3000) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate__animated animate__fadeInRight z-50';
    errorMessage.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            ${message}
        </div>
    `;
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
        errorMessage.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            if (document.body.contains(errorMessage)) {
                document.body.removeChild(errorMessage);
            }
        }, 300);
    }, duration);
}

// Enhanced success message
function showSuccess(message, duration = 3000) {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate__animated animate__fadeInRight z-50';
    successMessage.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            ${message}
        </div>
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            if (document.body.contains(successMessage)) {
                document.body.removeChild(successMessage);
            }
        }, 300);
    }, duration);
}

// Export functions for site administrators
window.AppointmentlyAdmin = {
    addServiceImage,
    removeServiceImage,
    serviceImages,
    saveAppointment,
    getAppointments,
    cancelAppointment,
    showError,
    showSuccess
}; 

// Mobile menu functionality
function addMobileMenuListeners() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Close mobile menu when clicking on a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('animate__fadeInDown');
            // Change hamburger to X
            mobileMenuButton.innerHTML = `
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
        } else {
            closeMobileMenu();
        }
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenu && mobileMenuButton) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('animate__fadeInDown');
        // Change X back to hamburger
        mobileMenuButton.innerHTML = `
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
    }
} 

// Enhanced responsive design functionality
function addResponsiveDesignFeatures() {
    // Handle window resize
    window.addEventListener('resize', function() {
        // Close mobile menu on resize if screen becomes larger
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
        
        // Recalculate calendar layout if needed
        if (document.getElementById('calendar')) {
            renderCalendar();
        }
    });
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Recalculate layouts after orientation change
            if (document.getElementById('calendar')) {
                renderCalendar();
            }
        }, 100);
    });
    
    // Add touch-friendly interactions for mobile
    if ('ontouchstart' in window) {
        addTouchInteractions();
    }
    
    // Add responsive table handling
    addResponsiveTableHandling();
    
    // Add responsive form handling
    addResponsiveFormHandling();
}

function addTouchInteractions() {
    // Add touch feedback to interactive elements
    const touchElements = document.querySelectorAll('.service-card, .time-slot, .calendar-day, button');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

function addResponsiveTableHandling() {
    // Handle responsive table scrolling on mobile
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const wrapper = table.closest('.overflow-x-auto');
        if (wrapper) {
            // Add smooth scrolling for table on mobile
            if (window.innerWidth < 768) {
                wrapper.style.scrollBehavior = 'smooth';
            }
        }
    });
}

function addResponsiveFormHandling() {
    // Handle form responsiveness on mobile
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Add better mobile form handling
        if (window.innerWidth < 768) {
            form.addEventListener('submit', function(e) {
                // Ensure form is properly handled on mobile
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.style.minHeight = '44px'; // iOS minimum touch target
                }
            });
        }
    });
} 