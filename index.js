import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
        
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
const database = getDatabase(app);
const batchesInDB = ref(database, "Batches");

// Calendar Elements
const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthYear = document.getElementById('currentMonthYear');

// active batch element
const activeBatches = document.getElementById('activeBatches');

// Edit Batch modal elements
const editBatchModal = document.getElementById('editBatchModal');
const editBatchBtn = document.getElementById("editBatchBtn");
const closeEditBatch = document.getElementsByClassName("closeEditBatch")[0];

// New Batch modal Elements
const newBatchModal = document.getElementById("newBatchModal");
const newBatchBtn = document.getElementById("newBatchBtn");
const closeNewBatch = document.getElementsByClassName("closeNewBatch")[0];

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

    // populate events from DB
    
}

// get batches from DB into an array and render active batches
function getActiveBatches() {
    
    // clear active batches
    activeBatches.innerHTML = ``

    // get snapshot of batches + values in DB
    onValue(batchesInDB, function(snapshot) {
        let batchesArray = Object.values(snapshot.val())

        let activeBatchesHTML = ``

        //render active batches
        for(const batch of batchesArray){
            if (batch.isActive === true){
            activeBatchesHTML += `
                <div class="active-batch" id="batch-${batch.startingDate}">
                <img src="assets/yoshi-egg-mirror.png">
                <h3>${batch.startingDate}</h3>
                <img src="assets/yoshi-egg.png">
                </div>`
            }
        }

        activeBatches.innerHTML = activeBatchesHTML

        // Now that the active-batch elements have been created, add click event listeners
        const activeBatchElements = document.getElementsByClassName('active-batch');
        for (let i = 0; i < activeBatchElements.length; i++) {
            activeBatchElements[i].addEventListener('click', function() {
                //bring up the modal
                editBatchModal.style.display = "block";
                //pull in the batch data from the database for the clicked batch and fill the form
                editBatchModal.innerHTML = `
                <div class="modal-content">
                    <div class="closeEditBatch">&times;</div>
                    <h1>Edit Batch</h1>
                    <form id="editBatchForm">
                        <label for="editStartingDate">Starting Date:</label>
                        <input type="date" id="editStartingDate" name="editStartingDate" pattern="\d{4}/\d{2}/\d{2}" required>
                        <br><br>
        
                        <label for="editStartingEggs">Starting Eggs:</label>
                        <input type="number" id="editStartingEggs" name="editStartingEggs" min="0" required>
                        <br><br>
        
                        <label for="editBrokenEggs">Broken Eggs:</label>
                        <input type="number" id="editBrokenEggs" name="editBrokenEggs" min="0" required>
                        <br><br>
        
                        <label for="editStrain">Strain:</label>
                        <input type="editStrain" id="editStrain" name="editStrain">
                        <br><br>
        
                        <label for="editVendor">Vendor:</label>
                        <input type="text" id="editVendor" name="editVendor" required>
                        <br><br>
        
                        <label for="editIsLate">Was it Late?:</label>
                        <input type="checkbox" id="editIsLate" name="editIsLate">
                        <br><br>
        
                        <button type="submit" id="submitEditBatch">Submit</button>
                    </form>
                </div>`
                //update data in the database on sumbit, clear the form and hide the modal
            });
        }
    })
}

// Submit new batch to the DB
submitNewBatch.addEventListener('click', (e) => {
    e.preventDefault();
    set(ref(database, "Batches/" + startingDate.value),{
        startingDate: startingDate.value,
        startingEggs: startingEggs.value,
        brokenEggs: brokenEggs.value,
        strain: strain.value,
        vendor: vendor.value,
        isLate: isLate.value,
        isActive: true
    }).then(() => {
        newBatchForm.reset();
        newBatchModal.style.display = "none";
        getActiveBatches();
    })
});

// Open new batch modal when the button is clicked
newBatchBtn.onclick = function () {
    newBatchModal.style.display = "block";
};

// Close the modals when the 'x' is clicked
closeNewBatch.onclick = function () {
    newBatchModal.style.display = "none";
};
closeEditBatch.onclick = function () {
    editBatchModal.style.display = "none";
};


prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    drawCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    drawCalendar(currentDate);
});

drawCalendar(currentDate);
getActiveBatches();