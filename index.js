import { events } from './data.js'
import { batches } from './data.js'

const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthYear = document.getElementById('currentMonthYear');

let currentDate = new Date();

function newBatch() {
    // open a modal form to create a new batch
    // when submitted send the batch to DB as JSON
}


function getEvents() {
    // retrieve this months events from the DB for now just look at local data
    for (const event of events) {
        //insert an element on the appropriate day for each event
        document.getElementById(event.date).innerHTML += `<div class="${event.type}">${event.batchId}<br>${event.type}</div`
    }
    // iterate through the events
        // create a new element for each even on the day they should occur
}

function drawCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();

    // Clear the calendar
    calendar.innerHTML = '';

    // Add day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayName = document.createElement('div');
        dayName.textContent = day;
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
        day.id = `${year}-${month + 1}-${i}`
        calendar.appendChild(day);
    }

    // populate batch events
    getEvents()

    // update top month name
    currentMonthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    drawCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    drawCalendar(currentDate);
});

drawCalendar(currentDate);