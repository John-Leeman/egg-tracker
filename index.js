import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, update, remove } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
        
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCyH88GFsWEXDTkb7cIS5kULAXL__jWfgQ",
    authDomain: "hygieia-egg-tracker.firebaseapp.com",
    projectId: "hygieia-egg-tracker",
    storageBucket: "hygieia-egg-tracker.appspot.com",
    messagingSenderId: "384419643501",
    appId: "1:384419643501:web:cc6469a1d685e86d233f64",
    measurementId: "G-453L9854ET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)

// Calendar Elements
const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthYear = document.getElementById('currentMonthYear');

// New Batch modal Elements
const newBatchModal = document.getElementById("newBatchModal");
const newBatchBtn = document.getElementById("newBatchBtn");
const closeNewBacth = document.getElementsByClassName("closeNewBacth")[0];

// New batch form elements
const newBatchForm = document.getElementById('newBatchForm')
const startingDate = document.getElementById('startingDate')
const startingEggs = document.getElementById('startingEggs')
const brokenEggs = document.getElementById('brokenEggs')
const strain = document.getElementById('strain')
const vendor = document.getElementById('vendor')
const isLate = document.getElementById('isLate')
const submitNewBatch = document.getElementById('submitNewBatch')

// Get current date
let currentDate = new Date();

// Open the modal when the button is clicked
newBatchBtn.onclick = function () {
    newBatchModal.style.display = "block";
};

// Close the modal when the 'x' is clicked
closeNewBacth.onclick = function () {
    newBatchModal.style.display = "none";
};

// when submitted send the batch to DB as JSON


function drawCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthString = date.toLocaleDateString("en-US", {
        month: "2-digit",
    })
    const yearString = date.toLocaleDateString("en-US", {
        year: "numeric",
    })

    // Clear the calendar
    calendar.innerHTML = '';

    // Add day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayName = document.createElement('div');
        dayName.textContent = day;
        dayName.className = "calendarDay"
        calendar.appendChild(dayName);
    });

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty days before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.textContent = i;
        if (i < 10){
            day.id = `${yearString}-${monthString}-0${i}`
        } else {
            day.id = `${yearString}-${monthString}-${i}`
        }
        calendar.appendChild(day);
    }

    // update top month name
    currentMonthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    // populate current batches
    //retrieve active batches from the database for now get them from data.js

}

submitNewBatch.addEventListener('click', (e) => {
    e.preventDefault();
    set(ref(database, "Batches/" + startingDate.value),{
        startingDate: startingDate.value,
        startingEggs: startingEggs.value,
        brokenEggs: brokenEggs.value,
        strain: strain.value,
        vendor: vendor.value,
        isLate: isLate.value
    }).then(() => {
        newBatchForm.reset();
        newBatchModal.style.display = "none";
    })
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    drawCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    drawCalendar(currentDate);
});

drawCalendar(currentDate);