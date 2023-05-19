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
const submitEditBatch = document.getElementById('submitEditBatch');
const editBatchForm = document.getElementById('editBatchForm')
const closeEditBatch = document.getElementsByClassName("closeEditBatch")[0];
const editStartingDate = document.getElementById('editStartingDate')
const editStartingEggs = document.getElementById('editStartingEggs')
const editBrokenEggs = document.getElementById('editBrokenEggs')
const editStrain = document.getElementById('editStrain')
const editVendor = document.getElementById('editVendor')
const editIsLate = document.getElementById('editIsLate')

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
    const day = date.getDay();
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

    // highlight current date
    let formattedDate = `${year}-${(1 + month).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    document.getElementById(formattedDate).classList.add("current-date");

    // populate events from DB
    
}

// get batches from DB into an array and render active batches
function getActiveBatches() {
    
    // clear active batches
    activeBatches.innerHTML = ``

    // get snapshot of batches + values in DB
    onValue(batchesInDB, function(snapshot) {
        let batchesArray = Object.values(snapshot.val())

        //render active batches

        let activeBatchesHTML = ``

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
            activeBatchElements[i].addEventListener('click', function(e) {
                //bring up the modal
                editBatchModal.style.display = "block";
                //pull in the batch data from the database for the clicked batch
                const clickedBatchInDB = ref(database, `/Batches/${e.target.innerText}`);
                onValue(clickedBatchInDB, function(snapshot) {
                    const clickedBatch = snapshot.val()
                    //fill the form with values from clickedBatch
                    editStartingDate.value = clickedBatch.startingDate
                    editStartingEggs.value = clickedBatch.startingEggs
                    editBrokenEggs.value = clickedBatch.brokenEggs
                    editStrain.value = clickedBatch.strain
                    editVendor.value = clickedBatch.vendor
                    editIsLate.checked = clickedBatch.isLate
                })
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
        isLate: isLate.checked,
        isActive: true
    }).then(() => {
        newBatchForm.reset();
        newBatchModal.style.display = "none";
        getActiveBatches();
    })
});

//update data in the database on editModal submit, clear the form and hide the modal
submitEditBatch.addEventListener('click', (e) => {
    e.preventDefault();
    update(ref(database, "Batches/" + editStartingDate.value),{
        startingDate: editStartingDate.value,
        startingEggs: editStartingEggs.value,
        brokenEggs: editBrokenEggs.value,
        strain: editStrain.value,
        vendor: editVendor.value,
        isLate: editIsLate.checked,
        isActive: true
    }).then(() => {
        editBatchForm.reset();
        editBatchModal.style.display = "none";
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