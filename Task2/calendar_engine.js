/**
 * Simple event calendar
 */

// ### Implementing Set ###
// ######################################################################################################3

var debug = true;

/**
 * Create hash set object
 * @param array [optional] Array with values to fill the hash set being created with.
 * @constructor
 */
function Set(array) {
    "use strict";
    var i;
    if (array) {
        for (i = 0; i < array.length; i++) {
            this.add(array[i]);
        }
    }
}

/**
 * Add value to the set
 * @param item Item to add
 * @return {Set} object itself
 */
Set.prototype.add = function (item) {
    "use strict";
    this[item] = true;
    return this;
};

/**
 * Return if the set has an item
 * @param item Item to search for
 * @return {Boolean}
 */
Set.prototype.has = function (item) {
    "use strict";
    return this.hasOwnProperty(item);
};

/**
 * Remove object from set. If item is missing, do nothing.
 * @param item Item to remove
 * @return {Set} object itself
 */
Set.prototype.remove = function (item) {
    "use strict";
    if (this.hasOwnProperty(item)) {
        delete this[item];
    }
    return this;
};

/**
 * Remove object from set and return it. If item is missing, return undefined.
 * @param item Item to remove
 * @return {item} removed item, if exists, otherwise undefined.
 */
Set.prototype.pop = function (item) {
    "use strict";
    if (this.hasOwnProperty(item)) {
        delete this[item];
    } else {
        item = undefined;
    }
    return item;
};

/**
 * Get copy of set in array
 * @return {Array} copy of set
 */
Set.prototype.asArray = function () {
    "use strict";
    var prop,
        array = [];
    for (prop in this) {
        if (this.hasOwnProperty(prop)) {
            array.push(prop);
        }
    }
    return array;
};


// ### Event ###
// #####################################################################################################

/**
 * Create new event.
 * @param properties Object containing entries:
 *      title: (string),
 *      eventDate: (date),
 *      persons: (comma separated string),
 *      description: (string)
 * @constructor
 */
function Event(properties) {
    "use strict";
    this._id = Event._generateId();
    this._creationDate = new Date();

    this._createListeners();

    this.updateProperties(properties);
    log("[Event] Created Event with id " + this._id);
}

Event.prototype._createListeners = function () {
    this._onTitleChangeListeners = [];
    this._onDateChangeListeners = [];
    this._onPersonsChangeListeners = [];
    this._onDescriptionChangeListeners = [];
    this._onDeleteListeners = [];
    this._onAnyPropertyChangeListener = [];
}

Event.propertySet = new Set(['id', 'creationDate', 'title', 'eventDate', 'persons', 'description']);
Event.updatablePropertySet = (new Set(Event.propertySet.asArray())).remove('id').remove('creationDate');
Event.onPropertyChangeListeners = {
    'title':'_onTitleChangeListeners',
    'eventDate':'_onDateChangeListeners'
    //'persons': '_onPersonsChangeListeners,
    //'description': '_onDescriptionChangeListeners'
};

Event.prototype.getProperties = function () {
    "use strict";
    var o = {},
        prop,
        value,
        i,
        propertiesList = Event.propertySet.asArray();
    for (i = 0; i < propertiesList.length; i++) {
        prop = propertiesList[i];
        value = this['_' + prop];
        if (value !== undefined) {
            o[prop] = value;
        }
    }
    // log("[Event] Properties accessed on event " + this._id);
    return o;
};

/**
 * Update properties with the provided object key-values.
 * @param properties
 */
Event.prototype.updateProperties = function (properties) {
    "use strict";
    log("[Event] Updating properties on event " + this._id);
    var prop,
        old_value,
        new_value,
        at_least_one_property_has_been_changed = false,
        i,
        change_property_listeners = this._onAnyPropertyChangeListener;
    for (prop in properties) {
        if (!properties.hasOwnProperty(prop)) {
            continue;
        }
        if (!Event.updatablePropertySet.has(prop)) {
            throw new Error("Property " + prop + " is not updatable.");
        }
        old_value = this['_' + prop];
        new_value = properties[prop];
        if (old_value == new_value) {
            continue;
        }
        if (prop == 'eventDate') {
            if (new_value) {
                new_value = new Date(new_value.getFullYear(), new_value.getMonth(), new_value.getDate());
                if (old_value && new_value && old_value.getTime() === new_value.getTime()) {
                    continue;
                }
            }
        }
        this['_' + prop] = new_value;
        this.onPropertyChange(prop, old_value, new_value);
        at_least_one_property_has_been_changed = true;
    }
    this._checkProperties();
    if (at_least_one_property_has_been_changed) {
        for (i = 0; i < change_property_listeners.length; i++) {
            change_property_listeners[i](this);
        }
    }
    log("[Event] Properties updated on event " + this._id);
};

/**
 * Check all important properties to be correct.
 * For example, if date is not specified, the program won't work correctly.
 * return true of all OK, false if something is wrong
 * @private
 */
Event.prototype._checkProperties = function () {
    "use strict";
    var status = true;
    if (!(this._eventDate instanceof Date)) {
        status = false;
        throw new Error("[Event]! Provided date is not Date object");
    }
    return status;
};

/**
 * Call all listeners for specified event change
 * @param prop Changed property name
 * @param oldValue Old property value
 * @param newValue New property value
 * @return {*}
 */
Event.prototype.onPropertyChange = function (prop, oldValue, newValue) {
    "use strict";
    log("[Event] Property changing is processed on property: " + prop);
    if (!Event.onPropertyChangeListeners.hasOwnProperty(prop)) {
        return this;
    }
    var i,
        listener,
        prop_listeners = this[Event.onPropertyChangeListeners[prop]];
    for (i = 0; i < prop_listeners.length; i++) {
        listener = prop_listeners[i];
        listener(this, oldValue, newValue);
    }
    log("[Event] Property changing has been processed on property: " + prop);
    return this;
};

/**
 * Delete event.
 * This will trigger all deletion listeners on this action.
 */
Event.prototype.remove = function () {
    "use strict";
    log("[Event] Removing is called on event with id: " + this._id);
    var i,
        listeners = this._onDeleteListeners;
    for (i = 0; i < listeners.length; i++) {
        listeners[i](this);
    }
};


Event.compareEventsByDueDate = function (event1, event2) {
    'use strict';
    return event1.getEventDate() - event2.getEventDate();
};

Event.compareEventsByName = function (event1, event2) {
    'use strict';
    var name1 = event1.getProperties().title ? event1.getProperties().title : event1.getProperties().id
    var name2 = event2.getProperties().title ? event2.getProperties().title : event2.getProperties().id
    return name1.localeCompare(name2);
};


/**
 * Generate next Event ID
 * @return {number} ID
 * @private
 */
Event._generateId = function () {
    "use strict";
    return guid4();
};


Event.prototype.addDateChangeListener = function (listener) {
    "use strict";
    log("[Event] Date change listener added to event with id: " + this._id);
    this._onDateChangeListeners.push(listener);
};

Event.prototype.addDeleteListener = function (listener) {
    "use strict";
    log("[Event] Deletion listener added to event with id: " + this._id);
    this._onDeleteListeners.push(listener);
};

Event.prototype.addTitleChangeListener = function (listener) {
    "use strict";
    log("[Event] Title change listener added to event with id: " + this._id);
    this._onTitleChangeListeners.push(listener);
};

Event.prototype.addAnyPropertyChangeListener = function (listener) {
    "use strict";
    log("[Event] AnyProperty change listener added to event with id: " + this._id);
    this._onAnyPropertyChangeListener.push(listener);
};

Event.prototype.toJSON = function () {
    var properties = Event.propertySet.asArray(),
        attribute,
        i,
        replacer = {};
    log("[Event] Converting event " + this._id + " to JSON");
    for (i = 0; i < properties.length; i++) {
        attribute = '_' + properties[i];
        replacer[attribute] = this[attribute];
    }
    console.log(replacer);
    return replacer;
};

Event.fromJSON = function (data) {
    var event,
        i;
    event = Object.create(Event.prototype); // creating virgin event
    event._createListeners();
    for (key in data) {
        if (!data.hasOwnProperty(key)) continue;
        event[key] = data[key];
    }
    event._eventDate = new Date(data._eventDate);
    log("[Event] Event " + event._id + " loaded from JSON");
    return event;
};


/**
 * Generate JSON representation of event
 * @return {string}
 */
Event.prototype.dump = function () {
    "use strict";
    log("[EM] Dumping Event to JSON");
    return JSON.stringify(this);
};


// ### Event Manager ###
// #####################################################################################################

/**
 * Create EventManager, keeping all the events in hash-map by a day
 * @constructor
 */
function EventManager() {
    "use strict";
    this._eventsByDate = {}; // date->[list of events] mapping
    this._eventsById = {}; // eventId -> event mapping
    log("[EM] Creating new EventManager.");
    this._initializeFromLocalStorage();
};

/**
 * Register event for a specified day
 * @param event
 * @param date
 * @private
 */
EventManager.prototype._registerEventDate = function (event, date) {
    "use strict";
    if (!this._eventsByDate.hasOwnProperty(date.toDateString())) {
        this._eventsByDate[date.toDateString()] = [];
        log("[EM] New day added to EventManager " + date.toDateString());
    }
    this._eventsByDate[date.toDateString()].push(event);
    this._eventsByDate[date.toDateString()].sort(Event.compareEventsByName);
    log("[EM] Event " + event.getProperties().id + " registered for date " + date.toDateString());
};

/**
 * Unregister event from a specified day
 * @param event
 * @param date
 * @private
 */
EventManager.prototype._unregisterEventDate = function (event, date) {
    "use strict";
    var index;
    if (date === undefined) {
        date = event.getProperties().eventDate;
    }
    log("[EM] Unregistering event " + event.getProperties().id + " from date " + date.toDateString());
    if (!this._eventsByDate.hasOwnProperty(date.toDateString())) {
        log("[EM] Error. No such date.")
        return;
    }
    index = this._eventsByDate[date.toDateString()].indexOf(event);
    if (index >= 0) {
        this._eventsByDate[date.toDateString()].splice(index, 1);
    } else
        log("[EM] Error. No such event for the date.");
}

/**
 * Add event and register it but withouth saving to LocalStorage
 * @param event
 * @private
 */
EventManager.prototype._addEventWithoutSavingToLocalStorage = function (event) {
    event.addDateChangeListener(this.eventDateChangeListener.bind(this));
    event.addDeleteListener(this.eventDeletionListener.bind(this));
    event.addAnyPropertyChangeListener(this._updateEventInLocalStorage.bind(this));
    this._registerEventDate(event, event.getProperties().eventDate);
    this._eventsById[event.getProperties().id] = event;
}

/**
 * Add event
 * @param event
 */
EventManager.prototype.addEvent = function (event) {
    "use strict";
    log("[EM] Adding new event to the manager.");
    this._addEventWithoutSavingToLocalStorage(event);
    this._addNewEventToLocalStorage(event);
};

/**
 * Remove event by Id
 * @param eventId
 * @return {*}
 */
EventManager.prototype._removeEvent = function (eventId) {
    "use strict";
    log("[EM] Removing event from the manager with eventId: " + eventId);
    var event = this.getEventById(eventId);
    this._unregisterEventDate(event);
    delete this._eventsById[eventId];
    return this;
};

/**
 * This is a callback function triggered on event date change.
 * @param event
 */
EventManager.prototype.eventDateChangeListener = function (event, oldDate, newDate) {
    "use strict";
    log("[EM] Triggered DateChangeListener");
    this._unregisterEventDate(event, oldDate);
    this._registerEventDate(event, newDate);
};

EventManager.prototype.eventDeletionListener = function (event) {
    "use strict";
    log("[EM] Triggered EventDeletionListener");
    this._removeEvent(event.getProperties().id);
    this._deleteEventFromLocalStorage(event.getProperties().id);
}


/**
 * Get event by Id
 * @param eventId
 * @return {*}
 */
EventManager.prototype.getEventById = function (eventId) {
    "use strict";
    log("[EM] Getting event by eventId: " + eventId);
    return this._eventsById[eventId];
};


/**
 * Get all the events for particular date
 * @param date
 * @return {*}
 */
EventManager.prototype.getEventsByDate = function (date) {
    "use strict";
    log("[EM] Getting events by Date: " + date.toDateString());
    var events = this._eventsByDate[date.toDateString()];
    if (events === undefined) {
        return []
    } else {
        return events;
    }
};


EventManager.prototype.getAllEventsInArray = function () {
    var event,
        eventID,
        arr = [];
    for (eventID in this._eventsById) {
        event = this._eventsById[eventID];
        arr.push(event);
    }
    return arr;
}


EventManager.prototype.toJSON = function () {
    var event,
        eventID,
        replacer = [];
    log("[EM] Generating JSON for EventManager");
    for (eventID in this._eventsById) {
        event = this._eventsById[eventID];
        replacer.push(event);
    }
    return replacer;
};

EventManager.fromJSON = function (data) {
    log("[EM] Reading EventManager from JSON");
    var unparsed = JSON.parse(data),
        i,
        event,
        em = new EventManager();
    for (i = 0; i < unparsed.length; i++) {
        event = Event.fromJSON(unparsed[i]);
        em.addEvent(event);
    }
    return em;
}


/**
 * Generate JSON representation of objects
 * @return {string}
 */
EventManager.prototype.dump = function () {
    "use strict";
    log("[EM] Dumping EventManager to JSON");
    return JSON.stringify(this, null, 4);
};


EventManager.prototype._updateEventInLocalStorage = function (event) {
    "use strict";
    log("[EM] Updating event in LocalStorage");
    localStorage.setItem('calendar-event:' + event.getProperties().id, event.dump());
}

EventManager.prototype._updateLocalStorageIndex = function () {
    var eventID,
        accumulator = [];
    for (eventID in this._eventsById) {
        accumulator.push(eventID);
    }
    log("[EM] Updating LocalStorage index.");
    localStorage.setItem('calendar-index', JSON.stringify(accumulator))
}

EventManager.prototype._addNewEventToLocalStorage = function (event) {
    "use strict";
    var eventID;
    log("[EM] Adding new event in LocalStorage");
    this._updateEventInLocalStorage(event);
    this._updateLocalStorageIndex();
}


EventManager.prototype._deleteEventFromLocalStorage = function (event_id) {
    "use strict";
    log("[EM] Deleting event from LocalStorage");
    localStorage.removeItem('calendar-event:' + event_id);
    this._updateLocalStorageIndex();
}

EventManager.prototype._initializeFromLocalStorage = function () {
    if (localStorage.getItem('calendar-index') === null) {
        return;
    }
    var eventIds = JSON.parse(localStorage.getItem('calendar-index')),
        eventId,
        event,
        i;
    log("[EM] Initializing from LocalStorage");
    for (i = 0; i < eventIds.length; i++) {
        eventId = eventIds[i];
        event = Event.fromJSON(JSON.parse(localStorage.getItem('calendar-event:' + eventId)));
        this._addEventWithoutSavingToLocalStorage(event);
    }
}

/**
 * Search for specified text and return array of event which contain it.
 * (Maybe I'll replace it with Trie search later if I have time. This will make search much more efficient)
 */
EventManager.prototype.searchForText = function (text) {
    var search_result = [],
        events,
        event,
        property,
        properties,
        search_in = ["title", "persons", "description"],
        i,
        j;
    if (!text) {
        return [];
    }
    text = text.toLowerCase();

    events = this.getAllEventsInArray();
    for (i = 0; i < events.length; i++) {
        event = events[i];
        properties = event.getProperties();

        for (j = 0; j < search_in.length; j++) {
            property = search_in[j];
            if (properties[property].toLowerCase().indexOf(text) != -1) {
                search_result.push(event);
                break;
            }
        }
    }
    return search_result;
}


// ### Calendar ###
// #######################################################################################################

/**
 * Create new Calendar which holds an instance of eventManger to keep all events and displayed calendar.
 * @param eventManager
 * @constructor
 */
function Calendar(eventManager) {
    var i,
        events = eventManager.getAllEventsInArray();
    this._eventManager = eventManager;
    this._divsByDates = {}; // to have instant access to the div representing the given date

    this._date = new Date(); // Start with current moment
    this._date = new Date(this._date.getFullYear(), this._date.getMonth());
    this.redrawCalendar();

    for (i = 0; i < events.length; i++) {
        this._addListenersToNewEvent(events[i])
    }
}

monthNames = {
    0:"Январь",
    1:"Февраль",
    2:"Март",
    3:"Апрель",
    4:"Май",
    5:"Июнь",
    6:"Июль",
    7:"Август",
    8:"Сентябрь",
    9:"Октябрь",
    10:"Ноябрь",
    11:"Деабрь"
}

dayNames = {
    0:"Воскресенье",
    1:"Понедельник",
    2:"Вторник",
    3:"Среда",
    4:"Четверг",
    5:"Пятница",
    6:"Суббота"
}

/**
 * Refill corresponding div with the events from the event manager for a particular date
 * @param date
 * @private
 */
Calendar.prototype.redrawDate = function (date) {
    log("[C]Redrawing date:" + date.toDateString())
    var div_holder = this._divsByDates[date.toDateString()];
    if (!div_holder) {
        log("[C]...No such date is displayed. Skipping.")
        return;
    }
    var events = this._eventManager.getEventsByDate(date);
    div_holder.innerHTML = '';
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var div_event = document.createElement("div");
        div_event.className = "event";
        div_event.id = event.getProperties().id;
        var content = document.createTextNode(event.getProperties().title ?
            event.getProperties().title :
            "Без названия");
        div_event.appendChild(content);
        div_holder.appendChild(div_event);
        attachEventUpdatePopover(div_event);
    }
    log("[C]...Div has been redrawn.")
}


/**
 * Generate new calendar table and insert (or update if exists) in the page.
 * This also update all the mappings from dates to divs.
 */
Calendar.prototype._generateAndUpdateTable = function () {
    log("[C] Generating and updating table.")
    this._divsByDates = {};

    var table = document.createElement('table');
    table.id = 'caltable';
    var table_body = document.createElement('body');
    var month = this._date.getMonth();
    var year = this._date.getFullYear();
    var displayingDay = new Date(year, month); // First day of the month
    while (displayingDay.getDay() != 1) { // if not Monday rewind day-by-day to the first encountered Monday
        displayingDay.setDate(displayingDay.getDate() - 1); // rewind one day back
    }

    var counter = 0;
    while (true) {
        var tr = document.createElement('tr');
        table.appendChild(tr);
        table.className = 'calendar';
        for (var i = 0; i < 7; i++) {
            var td = document.createElement('td');
            tr.appendChild(td);
            var div = document.createElement('div');
            div.className = 'cell';
            td.appendChild(div);
            var p = document.createElement('p');
            p.className = 'cday';
            p.innerHTML = counter < 7 ? dayNames[displayingDay.getDay()] + ", " + displayingDay.getDate() : displayingDay.getDate();
            div.appendChild(p);
            var div_events = document.createElement('div');
            div.appendChild(div_events);

            var date_to_store = new Date(displayingDay);
            this._divsByDates[date_to_store.toDateString()] = div_events;
            this.redrawDate(date_to_store);
            $(div).data('date', date_to_store);
            td.date = date_to_store;

            displayingDay.setDate(displayingDay.getDate() + 1);
            counter += 1;
        }
        // Check if the this day (which is monday) is the new month
        if (displayingDay.getMonth() != month) break;
    }
    var table_to_replace = document.getElementById('caltable');
    var div = document.getElementById('caldiv');
    if (table_to_replace) {
        div.replaceChild(table, table_to_replace);
    } else {
        div.appendChild(table);
    }

    reattachDayAddEventPopovers();
    log("[C] Table has been regenerated and updated.")
}

/**
 * Display month
 * @param date Date to take month from
 */
Calendar.prototype.redrawCalendar = function () {
    log("[C] Redrawing calendar")
    // Date between arrows
    document.getElementById('cdate').innerHTML = '' + monthNames[this._date.getMonth()] + ' ' + this._date.getFullYear();

    // Table
    this._generateAndUpdateTable();
}

/**
 * Show next month
 */
Calendar.prototype.nextMonth = function () {
    this._date.setMonth(this._date.getMonth() + 1);
    this.redrawCalendar();
}

/**
 * Show previous month
 */
Calendar.prototype.previousMonth = function () {
    this._date.setMonth(this._date.getMonth() - 1);
    this.redrawCalendar();
}

/**
 * Set calender to the current month.
 */
Calendar.prototype.setCurrentMonth = function () {
    var date = new Date(); // Start with current moment
    this.setMonth(date);
}

/**
 * Set calender to the specified month
 */
Calendar.prototype.setMonth = function (date) {
    if (this._date.getFullYear() != date.getFullYear() || this._date.getMonth() != date.getMonth()) {
        this._date = date;
        this.redrawCalendar();
    }
}


/**
 * Add listeners to new event
 * @param event
 * @private
 */
Calendar.prototype._addListenersToNewEvent = function (event) {
    event.addDateChangeListener(this.eventDateChangeListener.bind(this));
    event.addDeleteListener(this.eventDeletionListener.bind(this));
    event.addTitleChangeListener(this.eventTitleChangeListener.bind(this));
}

/**
 * Add new event.
 * Adds to eventManager and updates currently displayed calendar.
 * @param event
 */
Calendar.prototype.addEvent = function (event) {
    "use strict";
    log("[C] Adding new event to the calendar.");
    this._eventManager.addEvent(event);
    this.redrawDate(event.getProperties().eventDate);
    this._addListenersToNewEvent(event);
};

/**
 * If div for specified day is displayed, remove event from this div and redraw it.
 * @param event
 * @param date
 * @private
 */
Calendar.prototype._removeEventFromDiv = function (event, date) {
    "use strict";
    log("[C] Removing event " + event.getProperties().id + " from div if displayed.");
    var div_holder = this._divsByDates[date.toDateString()];
    if (!div_holder) {
        log("   This date is not displayed. Skipping.");
        return;
    }
    var event_div = document.getElementById(event.getProperties().id);
    div_holder.removeChild(event_div);
    // The element will redraw itself on removeChild.
    log("[C]...Event has been removed from div.");
}

/**
 * Get div corresponding to concrete date.
 * Returns undefined if specified day is not displayed.
 * @param date
 */
Calendar.prototype.getDivByDate = function (date) {
    var day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return  this._divsByDates[day.toDateString()];
}


/**
 * This is a callback function triggered on event date change.
 * @param event
 */
Calendar.prototype.eventDateChangeListener = function (event, oldDate, newDate) {
    "use strict";
    log("[C] Triggered DateChangeListener");
    this._removeEventFromDiv(event, oldDate);
    this.redrawDate(newDate);
};

Calendar.prototype.eventDeletionListener = function (event) {
    "use strict";
    log("[C] Triggered EventDeletionListener");
    this._removeEventFromDiv(event, event.getProperties().eventDate);
}

Calendar.prototype.eventTitleChangeListener = function (event, oldTitle, newTitle) {
    "use strict";
    log("[C] Triggered eventTitleChangeListener");
    this.redrawDate(event.getProperties().eventDate);
}

// ### Miscellaneous ###
// ########################################################################################################

function createGetter(propertyName) {
    //noinspection JSLint
    function getProperty() {
        return this[propertyName];
    }

    return getProperty;
}

function createSetter(propertyName) {
    //noinspection JSLint
    function setProperty(propertyValue) {
        this[propertyName] = propertyValue;
        return this;
    }

    return setProperty;
}

function guid4() {
    "use strict";
    log("[guid4] Generating new unique uuid");
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
};

/**
 * Write debug message to console if debug flag is true.
 * @param s
 */
function log(s) {
    if (debug) {
        console.log(s)
    }
}


// ## Initialization from LocalStorage
// ############################
// ### Populate with JSON data if LocalStorage is empty ###
// #########################################################

if (localStorage.getItem('calendar-index') === null) {
    em = EventManager.fromJSON('[\
    {\
        "_id": "55aeb9b6-a8e9-4625-99ea-eddc1fe4f192",\
        "_creationDate": "2013-03-30T23:48:26.147Z",\
        "_title": "Февраль-Март",\
        "_eventDate": "2013-02-26T20:00:00.000Z",\
        "_persons": "",\
        "_description": ""\
    },\
    {\
        "_id": "2113134e-10f5-4edd-a6c5-22afc09bae54",\
        "_creationDate": "2013-03-30T23:48:48.031Z",\
        "_title": "Апрель-Май",\
        "_eventDate": "2013-05-01T20:00:00.000Z",\
        "_persons": "",\
        "_description": ""\
    },\
    {\
        "_id": "6acbff55-9763-4604-a0c6-9cce0946859e",\
        "_creationDate": "2013-03-30T23:49:07.569Z",\
        "_title": "_На первом месте",\
        "_eventDate": "2013-03-12T20:00:00.000Z",\
        "_persons": "",\
        "_description": ""\
    },\
    {\
        "_id": "5b585d2e-4ee7-4995-85c3-34f17c73ea47",\
        "_creationDate": "2013-03-30T23:49:59.351Z",\
        "_title": "На втором месте",\
        "_eventDate": "2013-03-12T20:00:00.000Z",\
        "_persons": "",\
        "_description": ""\
    }\
]')
} else {
    em = new EventManager();
}
c = new Calendar(em);


// ## UI, Hooks and bindings
// ##############################
document.getElementById("prevmonth").onclick = c.previousMonth.bind(c);
document.getElementById("nextmonth").onclick = c.nextMonth.bind(c);
document.getElementById("currmonth").onclick = c.setCurrentMonth.bind(c);
document.getElementById("refresh").onclick = c.redrawCalendar.bind(c);

$popover = $('#addArbitraryButton').popover({
    html:true,
    placement:"bottom",
    content:function () {
        return $("#addArbitraryDateForm").html();
    }
});

/**
 * Parse string from top adding button and create event adding dialog with prefilled values.
 * @param button
 */
function parseAndAddEventFromTopAddInput(button) {
    var form = $(button).closest('div.popover-content').find("form.addArbitraryDateFormClass"),
        value = form.find('input#addArbitraryDateFormInput').val(),
        sep = ',',
        date,
        title;
    if (!value) {
        return;
    }
    if (value.indexOf(';') != -1) {
        sep = ';';
    }
    var split = value.split(sep);
    if (!split[1]) {
        date = moment(new Date());
        title = split[0];
    } else {
        date = moment(split[0]);
        if (!date.isValid()) {
            date = moment(new Date());
        }
        title = split[1];
    }

    $('button#addArbitraryButton').popover('hide');

    c.setMonth(date.toDate());
    var div = c.getDivByDate(date.toDate());
    if (!div) {
        log('[Hooks] [parseEventFromInput] Can not get div by date');
        return;
    }
    log('[Hooks] [parseEventFromInput] Add arbitrary event string has been parsed. Showing popover for specific date.');
    var context = $(div).closest('div.cell').popover('show');
    $(context.data('popover').$tip[0]).find('input#title').attr('value', title);
}

/**
 * Attach popover to Event div
 * @param event_div
 */
function attachEventUpdatePopover(event_div) {
    var event_id = event_div.id,
        event = em.getEventById(event_id);
    $(event_div).popover({
        html:true,
        trigger:'manual',
        content:function () {
            log('[Hooks] EventUpdatePopover triggered.');
            var form = $("#EventEditForm");
            form.data('event_id', event_id);
            form.find("input#date").attr('value', moment(event.getProperties().eventDate).format("YYYY-MM-DD"));
            form.find("input#title").attr('value', event.getProperties().title);
            form.find("input#participants").attr('value', event.getProperties().persons);
            form.find("textarea#description").text(event.getProperties().description);
            return form.html();
        }
    }).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).popover('toggle');
        });

    $(event_div).
        on('show',
        function (event) {
            $('*').not(event.target).popover('hide');
        });
};


/**
 * Attach popovers to all the divs of currently displayed days.
 */
function reattachDayAddEventPopovers() {
    $("div.cell").popover({
        html:true,
        trigger:'manual',
        content:function () {
            log('[Hooks] DayPopover triggered.');
            var date = new Date($(this).data('date'));
            var dateText = moment(date).format("YYYY-MM-DD");
            var form = $("#AddSpecificDateForm");
            form.find("input#date").attr('value', dateText);
            form.find("input#title").attr('value', '');
            form.find("input#participants").attr('value', '');
            form.find("textarea#description").val('');
            return form.html();
        }
    }).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).popover('toggle');
        });

    $('div.cell').
        on('show',
        function (event) {
            $('*').not(event.target).popover('hide');
        });

};


/**
 * Create event from the typed to the form values and add it to the calendar and eventManager.
 * @param button
 */
function addEventFromForm(button) {
    log('[Hooks] Adding event from form.');
    var form = $(button).closest('div.popover-content').find("form.addSpecificDateFormClass"),
        title = form.find('input#title').val(),
        date = new Date(form.find('input#date').val()),
        participants = form.find('input#participants').val(),
        description = form.find('textarea#description').val();

    event = new Event({
        'title':title,
        'eventDate':date,
        'persons':participants,
        'description':description
    });

    c.addEvent(event);

    $('*').popover('hide');
}

/**
 * Delete event from form
 * @param button
 */
function deleteEventFromForm(button) {
    var event_id = $(button).closest(".popover").prev().attr('id');
    log('[Hooks] Deleting event from form. event_id: ' + event_id);
    $(button).closest(".popover").prev().popover('hide');
    em.getEventById(event_id).remove();
}

/**
 * Update event from form values
 * @param button
 */
function updateEventFromForm(button) {
    var event_id = $(button).closest(".popover").prev().attr('id');
    log('[Hooks] Updating event from form. event_id: ' + event_id);
    var form = $(button).closest('div.popover-content').find("form.EventEditFormClass"),
        title = form.find('input#title').val(),
        date = new Date(form.find('input#date').val()),
        participants = form.find('input#participants').val(),
        description = form.find('textarea#description').val();
    var new_values = {
        'title':title,
        'eventDate':date,
        'persons':participants,
        'description':description
    }
    log(new_values);
    $(button).closest(".popover").prev().popover('hide');
    em.getEventById(event_id).updateProperties(new_values);
}


var searchEvents = function (query, process) {
    log("[Search] Searching");
    var matched_events = em.searchForText(query),
        event,
        i,
        matched_events_ids = [],
        now = (new Date()).getTime();
    // Sort by closeness to the present moment
    matched_events.sort(function(a,b) {
        return Math.abs(a.getProperties().eventDate.getTime() - now) - Math.abs(b.getProperties().eventDate.getTime() - now);
    });
    for (i = 0; i < matched_events.length; i++) {
        event = matched_events[i];
        matched_events_ids.push(event.getProperties().id);
    }
    log("[Search] Calling typeahead callback.")
    process(matched_events_ids);
}

$('#searchbox').typeahead({
    source: searchEvents,
    highlighter: function (eventId) {
        var node = $("div.typeahead_wrapper"),
            event_properties = em.getEventById(eventId).getProperties();
        node.find(".typeahead_title").text(event_properties.title);
        node.find(".typeahead_date").text((moment(event_properties.eventDate)).format('DD-MM-YYYY'));
        return node.html();
    },
    matcher: function () {return true;},
    updater: function (eventId) {
        var event = em.getEventById(eventId),
            date = event.getProperties().eventDate,
            div_date,
            div_event;
        c.setMonth(date);
        div_date = c.getDivByDate(date);
        div_event = $(div_date).find("div#" + eventId);
        div_event.popover('show');
    }
});
//$("input#searchbox").bind('keyup', function () {searchEvents()});

// ### Library settings ###
// ##################################
moment.lang('ru');

