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

    this._onTitleChangeListeners = [];
    this._onDateChangeListeners = [];
    this._onPersonsChangeListeners = [];
    this._onDescriptionChangeListeners = [];
    this._onDeleteListeners = [];

    this.updateProperties(properties);
    log("[Event] Created Event with id " + this._id);
}

Event.propertySet = new Set(['id', 'creationDate', 'title', 'eventDate', 'persons', 'description']);
Event.updatablePropertySet = (new Set(Event.propertySet.asArray())).remove('id').remove('creationDate');
Event.onPropertyChangeListeners = {
    //'title': '_onTitleChangeListeners',
    'eventDate': '_onDateChangeListeners'
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
        new_value;
    for (prop in properties) {
        if (!properties.hasOwnProperty(prop)) {
            continue;
        }
        if (!Event.updatablePropertySet.has(prop)) {
            throw new Error("Property " + prop + " is not updatable.");
        }
        old_value = this['_' + prop];
        new_value = properties[prop];
        if (prop == 'eventDate') {
            new_value = new Date(new_value.getYear(), new_value.getMonth());
        }
        this['_' + prop] = new_value;
        this.onPropertyChange(prop, old_value, new_value);
    }
    this._checkProperties();
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

Event.prototype.toJSON = function () {
    var properties = Event.propertySet.asArray(),
        attribute,
        i,
        replacer = {};
    for (i = 0; i < properties.length; i++) {
        attribute = '_' + properties[i];
        replacer[attribute] = this[attribute];
    }
    console.log(replacer);
    return replacer;
};

Event.fromJSON = function (data) {
    var event = new Event({'eventDate': new Date()}),
        i;
    for (key in data) {
        if (!data.hasOwnProperty(key)) continue;
        event[key] = data[key];
    }
    event._eventDate = new Date(data._eventDate);
    return event;
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
};

/**
 * Register event for a specified day
 * @param event
 * @param date
 * @private
 */
EventManager.prototype._registerEventDate = function (event, date) {
    "use strict";
    if (!this._eventsByDate.hasOwnProperty(date)) {
        this._eventsByDate[date] = [];
        log("[EM] New day added to EventManager " + date);
    }
    this._eventsByDate[date].push(event);
    log("[EM] Event " + event.getProperties().id + " registered for date " + date);
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
    log("[EM] Unregistering event " + event.getProperties().id + " from date " + date);
    if (!this._eventsByDate.hasOwnProperty(date)) {
        log("[EM] Error. No such date.")
        return;
    }
    index = this._eventsByDate[date].indexOf(event);
    if (index >= 0)
        this._eventsByDate[date].splice(index, 1);
    else
        log("[EM] Error. No such event for the date.");
}

/**
 * Add event
 * @param event
 */
EventManager.prototype.addEvent = function (event) {
    "use strict";
    log("[EM] Adding new event to the manager.");
    event.addDateChangeListener(this.eventDateChangeListener.bind(this));
    event.addDeleteListener(this.eventDeletionListener.bind(this))
    this._registerEventDate(event, event.getProperties().eventDate)
    this._eventsById[event.getProperties().id] = event;
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

EventManager.prototype.eventDeletionListener = function(event) {
    "use strict";
    log("[EM] Triggered EventDeletionListener");
    this._removeEvent(event.getProperties().id)
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


EventManager.prototype.toJSON = function () {
    var event,
        eventID,
        replacer = [];
    for (eventID in this._eventsById) {
        event = this._eventsById[eventID];
        replacer.push(event);
    }
    return replacer;
};

EventManager.fromJSON = function (data) {
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
    return JSON.stringify(this, null, 4);
};






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
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
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


// ## Demonstation
// ############################

em = new EventManager();
e = new Event({'eventDate': new Date(), 'title': 'New event'});
em.addEvent(e);
e.updateProperties({'eventDate': new Date(2015,0)});
console.log(em);
s = em.dump()
console.log(s);
emn = EventManager.fromJSON(s);
console.log(emn);
