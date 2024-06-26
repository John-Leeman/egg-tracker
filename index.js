import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { eventColors } from "./event-colors.js";
        
// firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyH88GFsWEXDTkb7cIS5kULAXL__jWfgQ",
    authDomain: "hygieia-egg-tracker.firebaseapp.com",
    projectId: "hygieia-egg-tracker",
    storageBucket: "hygieia-egg-tracker.appspot.com",
    messagingSenderId: "384419643501",
    appId: "1:384419643501:web:cc6469a1d685e86d233f64",
    measurementId: "G-453L9854ET"
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const batchesInDB = ref(database, "Batches");

// Calendar Elements
const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthYear = document.getElementById('currentMonthYear');

// All modal elements
const allModals = document.getElementsByClassName("modal");

// active batch element
const activeBatches = document.getElementById('activeBatches');

// Edit Batch modal elements
const editBatchModal = document.getElementById('editBatchModal');
const deleteEditBatch = document.getElementById('deleteEditBatch');
const submitEditBatch = document.getElementById('submitEditBatch');
const editBatchForm = document.getElementById('editBatchForm')
const closeEditBatch = document.getElementsByClassName("closeEditBatch")[0];
const editStartingDate = document.getElementById('editStartingDate')
const editCurrentEggs = document.getElementById('editCurrentEggs')
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

//New event modal elements
const newEventBtn = document.getElementById('newEventBtn');
const newEventModal = document.getElementById('newEventModal');
const submitNewEvent = document.getElementById('submitNewEvent');
const closeNewEvent = document.getElementsByClassName("closeNewEvent")[0];
const newEventDropdown = document.getElementById('newEventDropdown')
const newEventForm = document.getElementById('newEventForm');
const newEventDate = document.getElementById('newEventDate');
const newEventType = document.getElementById('newEventType');
const newEventPox = document.getElementById('pox');
const newEventAe = document.getElementById('ae');
const newEventNotes = document.getElementById('newEventNotes')
const newEventEggs = document.getElementById('newEventEggs')

//Edit event modal elements
const editEventModal = document.getElementById('editEventModal');
const submitEditEvent = document.getElementById('submitEditEvent');
const closeEditEvent = document.getElementsByClassName("closeEditEvent")[0];
const editEventBatch = document.getElementById('editEventBatch')
const editEventForm = document.getElementById('editEventForm');
const editEventDate = document.getElementById('editEventDate');
const editEventType = document.getElementById('editEventType');
const editEventPox = document.getElementById('editPox');
const editEventAe = document.getElementById('editAe');
const editEventNotes = document.getElementById('editEventNotes')
const editEventEggs = document.getElementById('editEventEggs')
const deleteEditEvent = document.getElementById('deleteEditEvent')
const editEventComplete = document.getElementById('completeEditEvent')

// uuid function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let selectedEventId = ''

// get current date
let currentDate = new Date();

// create calendar
function drawCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthString = date.toLocaleDateString("en-US", {
        month: "2-digit",
    })
    const yearString = date.toLocaleDateString("en-US", {
        year: "numeric",
    })

    // clear the calendar
    calendar.innerHTML = '';

    // add day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayName = document.createElement('div');
        dayName.textContent = day;
        dayName.className = "calendarDay"
        calendar.appendChild(dayName);
    });

    // get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty days before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }

    // add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.innerHTML += 
            `<div class="day-number">${i}</div>
            <div class="event-container"></div>`;
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
    let highlightDate = new Date()
    if (highlightDate.getMonth() === month) {
        let formattedDate = `${highlightDate.getFullYear()}-${(1 + highlightDate.getMonth()).toString().padStart(2, '0')}-${highlightDate.getDate().toString().padStart(2, '0')}`;
        document.getElementById(formattedDate).classList.add("current-date");
    }
}

function getActiveEvents() {

    // get snapshot of batches + values in DB
    onValue(batchesInDB, function(snapshot) {

        // store them in an array
        let batchesArray = Object.values(snapshot.val())
        
        // get events from each batch in the array
        for(let i = 0; i < batchesArray.length; i++){
            if (batchesArray[i].events) {
                const events = Object.values(batchesArray[i].events)
                
                for (const event of events) {

                    // make html for each event
                    const eventHtml = event.isActive ? `<div class="event ${event.eventType}">${event.eventType}</div>` : `<div class="event complete ${event.eventType}">${event.eventType}</div>`;

                    // inject html into event date div of calendar
                    const eventElement = document.getElementById(event.eventDate)
                    
                    if(eventElement) {
                        const eventContainer = eventElement.querySelector('.event-container')
                        eventContainer.innerHTML += eventHtml

                        // add click event listener for each event
                        eventElement.addEventListener('click', function(e) {
                            //bring up the modal
                            editEventModal.style.display = "block";
                            //clear the dropdown
                            editEventBatch.innerHTML = ''
                            //generate the dropdown of active batches
                            for(let i = 0; i < batchesArray.length; i ++) {
                                let batchOption = document.createElement("option");
                                batchOption.textContent = batchesArray[i].startingDate;
                                batchOption.value = batchesArray[i].startingDate;
                                editEventBatch.appendChild(batchOption);
                            }
                            //fill the form with values from event
                            editEventDate.value = event.eventDate
                            editEventBatch.value = batchesArray[i].startingDate
                            editEventType.value = event.eventType
                            editEventEggs.value = event.eggs
                            editEventPox.checked = event.pox
                            editEventAe.checked = event.ae
                            editEventNotes.value = event.notes

                            //add event.id to local variable
                            selectedEventId = event.eventId
                        })
                    }
                        
                }
            }
        }
    })
}

// get batches from DB into an array and render active batches
function getActiveBatches() {
    
    // clear active batches
    activeBatches.innerHTML = ``

    // get snapshot of batches + values in DB
    onValue(batchesInDB, function(snapshot) {
        let batchesArray = Object.values(snapshot.val())

        // clear newEventDropdown
        newEventDropdown.innerHTML = ''
        
        // insert active batches into new event modal dropdown
        for(let i = 0; i < batchesArray.length; i++) {
            let batchOption = document.createElement("option");
            batchOption.textContent = batchesArray[i].startingDate;
            batchOption.value = batchesArray[i].startingDate;
            newEventDropdown.appendChild(batchOption);
        }

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
                    editCurrentEggs.value = clickedBatch.currentEggs
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
        currentEggs: startingEggs.value,
        brokenEggs: brokenEggs.value,
        strain: strain.value,
        vendor: vendor.value,
        isLate: isLate.checked,
        isActive: true
    }).then(() => {
        newBatchForm.reset();
        newBatchModal.style.display = "none";
        render();
    })
});

//submit new event to the DB
submitNewEvent.addEventListener('click', (e) => {
    e.preventDefault();
    const newEventId = generateUUID()
    update(ref(database, "Batches/" + newEventDropdown.value + "/events/" + newEventId),{
        isActive: true,
        eventId: newEventId,
        eventDate: newEventDate.value,
        eventType: newEventType.value,
        pox: newEventPox.checked,
        ae: newEventAe.checked,
        notes: newEventNotes.value,
        eggs: newEventEggs.value
    }).then(() => {
        newEventForm.reset();
        newEventModal.style.display = "none";
        render();
    })
})

//update data in the database on editBatch submit, clear the form and hide the modal
submitEditBatch.addEventListener('click', (e) => {
    e.preventDefault();
    update(ref(database, "Batches/" + editStartingDate.value),{
        startingDate: editStartingDate.value,
        currentEggs: editCurrentEggs.value,
        brokenEggs: editBrokenEggs.value,
        strain: editStrain.value,
        vendor: editVendor.value,
        isLate: editIsLate.checked,
        isActive: true
    }).then(() => {
        editBatchForm.reset();
        editBatchModal.style.display = "none";
        render();
    })
});

//update DB on editEvent sumbit
submitEditEvent.addEventListener('click', (e) => {
    e.preventDefault();
    update(ref(database, "Batches/" + editEventBatch.value + "/events/" + selectedEventId),{
        eventDate: editEventDate.value,
        eggs: editEventEggs.value,
        eventType: editEventType.value,
        pox: editEventPox.checked,
        ae: editEventAe.checked,
        notes: editEventNotes.value
    }).then(() => {
        editEventForm.reset();
        editEventModal.style.display = "none";
        render();
    })
})

//update DB on completeEvent submit

editEventComplete.addEventListener('click', (e) => {
    e.preventDefault();

    // Correctly handling the asynchronous operation
    const currentEggsRef = ref(database, "Batches/" + editEventBatch.value + "/currentEggs");
    get(currentEggsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const currentEggs = snapshot.val(); // Assuming 'currentEggs' is directly stored at this path
            const newEggsValue = parseInt(currentEggs) - parseInt(editEventEggs.value);

            // First update operation
            return update(ref(database, "Batches/" + editEventBatch.value), { currentEggs: newEggsValue });
        } else {
            throw new Error('Current eggs not found.');
        }
    }).then(() => {
        // Ensure this operation is a part of the promise chain
        return update(ref(database, "Batches/" + editEventBatch.value + "/events/" + selectedEventId), {
            isActive: false,
            eventDate: editEventDate.value,
            eggs: editEventEggs.value,
            eventType: editEventType.value,
            pox: editEventPox.checked,
            ae: editEventAe.checked,
            notes: editEventNotes.value
        });
    }).then(() => {
        // This code executes after both updates are successful
        editEventForm.reset();
        editEventModal.style.display = "none";
        render();
    }).catch((error) => {
        // Error handling
        console.error("Error updating data:", error);
    });
});

//update DB on editEvent delete
deleteEditEvent.addEventListener('click', (e) => {
    e.preventDefault()

    //remove the event from the database
    remove(
        ref(database, "Batches/" + editEventBatch.value + "/events/" + selectedEventId
    )).then(() => {
        editEventForm.reset();
        editEventModal.style.display = "none";
        render();
    })
})

//update DB on editBatch delete
deleteEditBatch.addEventListener('click', (e) => {
    e.preventDefault()

    //remove the batch from the database
    remove(
        ref(database, "Batches/" + editStartingDate.value
    )).then(() => {
        editBatchForm.reset();
        editBatchModal.style.display = "none";
        render();
    })
})

// Open modals when the button is clicked
newBatchBtn.onclick = function () {
    newBatchModal.style.display = "block";
};

newEventBtn.onclick = function () {
    newEventModal.style.display = "block"
}

// Close modals when the 'x' is clicked
closeNewBatch.onclick = function () {
    newBatchModal.style.display = "none";
};

closeEditBatch.onclick = function () {
    editBatchModal.style.display = "none";
};

closeNewEvent.onclick = function () {
    newEventModal.style.display = "none"
}

closeEditEvent.onclick = function () {
    editEventModal.style.display = "none"
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    render();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    render();
});

function render() {
    drawCalendar(currentDate);
    getActiveBatches();
    getActiveEvents();
    };

render();