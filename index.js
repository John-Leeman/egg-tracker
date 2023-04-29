import { batches } from '/data.js'

const calendar = document.getElementById('calendar');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthYear = document.getElementById('currentMonthYear');

let currentDate = new Date();

function newBatch() {
    // open a modal form to create a new batch
    // when submitted send the batch to DB as JSON
}

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
    let activeBatches = []
    //retrieve active batches from the database for now get them from data.js
    for (let i = 0; i < batches.length; i++) {
        if (batches[i].id.slice(0, 6) === `${yearString}-${monthString}`) {
            activeBatches.push(batches[i])
        }
    }

    console.log(activeBatches)
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