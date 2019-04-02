let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");
let currentEvent = {};

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let monthAndYear = document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

const next = () => {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

const previous = () => {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

const jump = () => {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

function getEvent(month, year, day) {
    const events = getLocalStorageData();
    const event = events === null
        ? { month: null, year: null, day: null }
        : events.find(e => e.month === month && e.year === year && e.day === day);
    return event === undefined ? { month: null, year: null, day: null } : event;
}

function saveEvent() {
    let events = getLocalStorageData();
    const eventText = document.querySelector("#eventDescription").value;
    if (eventText.trim() === "") {
        alert("Please type a description for the event");
    } else {
        currentEvent.text = eventText;
        if (events !== null) {
            const foundEvent = events.find(
                e => e.month === currentEvent.month
                    && e.year === currentEvent.year
                    && e.day === currentEvent.day
            );
            if (foundEvent) {
                foundEvent.text = currentEvent.text;
            } else {
                events.push(currentEvent);
            }
        } else {
            events = [];
            events.push(currentEvent);
        }
        this.setLocalStorageData(JSON.stringify(events));
        $('#eventModal').modal('toggle');
        showCalendar(currentMonth, currentYear);
    }
}

function deleteEvent() {
    let events = getLocalStorageData();
    const day = currentEvent.day;
    if (events !== null) {
        const index = events.findIndex(e => e.month === currentEvent.month && e.day === currentEvent.day && e.year === currentEvent.year);
        events.splice(index, 1);
        document.querySelector(`[data-id='${day}']`).classList.remove("event-assigned");
        this.setLocalStorageData(JSON.stringify(events));
        $('#eventModal').modal('toggle');
    }
}

function setLocalStorageData(data) {
    localStorage.setItem("CalendarAppEvents", data);
}

function getLocalStorageData() {
    const localStorageEventData = localStorage.getItem("CalendarAppEvents");
    return JSON.parse(localStorageEventData);
}

function showCalendar(month, year) {
    initBootstrapModal();
    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    let tbl = document.getElementById("calendar-body");

    tbl.innerHTML = "";

    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (date > daysInMonth) {
                break;
            } else {
                let cell = document.createElement("td");
                cell.setAttribute("data-id", date);
                cell.setAttribute("data-month", month);
                cell.setAttribute("data-year", year);
                cell.setAttribute("data-toggle", "modal");
                if (
                    year >= today.getFullYear()
                    && month >= today.getMonth()
                ){
                    cell.setAttribute("data-target", "#eventModal");
                }
                if (eventExistsOnDay(month, year, date)) {
                    cell.classList.add("event-assigned");
                    const event = getEvent(month, year, date);
                    let p = document.createElement("p");
                    p.appendChild(document.createTextNode(event.text));
                    cell.appendChild(p);
                }
                let cellText = document.createTextNode(date);
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("bg-info");
                }
                cell.prepend(cellText);
                row.appendChild(cell);
                date++;
            }
        }
        tbl.appendChild(row);
    }
}

function eventExistsOnDay(month, year, day) {
    const event = getEvent(month, year, day);
    if (event.month !== null
        && event.year !== null
        && event.day !== null) {
        return true
    }

    return false;
}

function initBootstrapModal() {
    $('#eventModal').on('show.bs.modal', function (event) {
        let month, year, day;
        month = parseInt(event.relatedTarget.dataset["month"]);
        year = parseInt(event.relatedTarget.dataset["year"]);
        day = parseInt(event.relatedTarget.dataset["id"]);
        currentEvent = getEvent(month, year, day);
        var modal = $(this)
        modal.find('.modal-title').text(`Create Event for ${months[month]} ${day} ${year}`);
        if (
            currentEvent.month !== null
            && currentEvent.year !== null
            && currentEvent.day !== null
        ) {
            modal.find('.modal-body textarea').val(currentEvent.text);
            document.querySelector("#deleteEventButton").style.display = "block";
            document.querySelector("#saveEventButton").textContent = "Edit Event";
        } else {
            currentEvent.month = month;
            currentEvent.year = year;
            currentEvent.day = day;
            modal.find('.modal-body textarea').val("");
            document.querySelector("#deleteEventButton").style.display = "none";
            document.querySelector("#saveEventButton").textContent = "Save Event";
        }
    });
}
