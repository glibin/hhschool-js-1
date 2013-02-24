/**
 * Simple even calendar
 */

/*
Вопросы:
##############

1) Делая счетчик для ID я вначале поместил его в прототип, и изменял там.
Но потом решил, что счетчик все-таки относится к классу, и доступ к нему через this
будет несколько сбивающим с толку.
В итоге я остановился на свойстве класса Event._lastId, а не на Event.prototype._lastId,
и получаю к нему доступ через Event._lastId, а не this._lastId.
Так как же в итоге правильно? Как обычно делают?

2) Нужно ли добавлять комментарии ко всем геттерам и сеттерам?

3) Этот вопрос касается не только JavaScript, но вообще в целом разработку с ООП.
В объекте Event есть поле Date. И его можно менять.
Но при его смене могут нарушиться инварианты в объекте, котоырй этот Event хранит (в данном случае
это EventManager, где объекты упорядочены в массиве по как раз этой дате.
В итоге не ясно, как же дизайнить эти объекты, чтобы изменения в объекте не ломали код в другом месте.
Использовать приватные методы для изменения даты, которые тайно будет использовать EventManager (таким
образом тесно связав эти объекты)?
Или делать какой-то callback в Event, который при изменении даты будет звонить тому, кто на изменения
этого поля рарегистрировался? Но не будет ли это слишком сложно?
Как обычно это решают?
 */

// ### Implementing Set ###
// ######################################################################################################3


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
 * Id of event is generated automatically basing on internal shared counter.
 * @param name Event name
 * @constructor
 */
function Event(name) {
    "use strict";
    this._id = Event._generateId();
    this.setName(name);
    this._creationDate = new Date();
    this._tags = new Set();
    this._people = {};
}

Event._lastId = -1; // The maximum ID of current events


Event.prototype.getId = createGetter('_id');

Event.prototype.getName = createGetter('_name');
Event.prototype.setName = createSetter('_name');

Event.prototype.getCreationDate = createGetter('_creationDate');

Event.prototype.getEventDate = createGetter('_eventDate');
Event.prototype.setEventDate = createSetter('_eventDate');

Event.prototype.getDescription = createGetter('_description');
Event.prototype.setDescription = createSetter('_description');

Event.prototype.addTag = function (tag) {
    this._tags.add(tag);
    return this;
};

Event.prototype.hasTag = function (tag) {
    return this._tags.has(tag);
};

Event.prototype.removeTag = function (tag) {
    this._tags.remove(tag);
    return this;
};

/**
 * Get copy of all tags in Array
 * @return {Array}
 */
Event.prototype.getTagArray = function () {
    return this._tags.asArray();
};

Event.prototype.addPerson = function (person) {
    this._people[person] = person;
    return this;
};

Event.prototype.hasPerson = function (person) {
    return this._people.hasOwnProperty(person);
};

Event.prototype.removePerson = function (person) {
    delete this._people[person];
    return this;
};

/**
 * Get copy of all persons in Array
 * @return {Array}
 */
Event.prototype.getPersonArray = function () {
    var person,
        array = [];
    for (person in this._people) {
        if (this._people.hasOwnProperty(person)) {
            array.push(this._people[person]);
        }
    }
    return array;
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
    Event._lastId++;
    return Event._lastId;
};

/**
 * Update event Id counter with the ID of this event
 * @return {Event}
 * @private
 */
Event.prototype.updateIdCounter = function () {
    "use strict";
    Event._lastId = Math.max(Event._lastId, this.getId());
    return this;
};



// ### Person ###
// #####################################################################################################

function Person(firstName, lastName, patronymic, email) {
    "use strict";
    this.setFirstName(firstName || '');
    this.setLastName(lastName || '');
    this.setPatronymic(patronymic || '');
    this.setEmail(email || '');
}

Person.prototype.getFirstName = createGetter('_firstName');
Person.prototype.setFirstName = createSetter('_firstName');

Person.prototype.getLastName = createGetter('_lastName');
Person.prototype.setLastName = createSetter('_lastName');

Person.prototype.getPatronymic = createGetter('_patronymic');
Person.prototype.setPatronymic = createSetter('_patronymic');

Person.prototype.getEmail = createGetter('_email');
Person.prototype.setEmail = createSetter('_email');

Person.prototype.toString = function () {
    // There should be an id to return it. But I haven't found a good simple hash generator.
    // So, if all the attributes are the same, the person is considered to be the same
    return [this.getFirstName(), this.getLastName(), this.getPatronymic(), this.getEmail()].join("; ");
};


// ### Event Manager ###
// #####################################################################################################

/**
 * Create EventManager, which would keep events in sorted order by due date, allowing to add events, remove them, etc.
 * @constructor
 */
function EventManager() {
    "use strict";
    this._events = []; // sorted by date (in fact, it should be ordered set, but this data structure is difficult to implement)
}

/**
 * Add event, keeping the invariant of them to be in sorted order by due date.
 * @param event
 */
EventManager.prototype.addEvent = function (event) {
    "use strict";
    this._events.push(event);
    this._events.sort(Event.compareEventsByDueDate);
};

/**
 * Remove event by Id
 * @param eventId
 * @return {*}
 */
EventManager.prototype.removeEvent = function (eventId) {
    "use strict";
    var i,
        new_events = [];
    for (i = 0; i < this._events.length; i++) {
        if (this._events[i].getId() !== eventId) {
            new_events.push(this._events[i]);
        }
    }
    this._events = new_events;
    return this;
};

/**
 * Get event by Id
 * @param eventId
 * @return {*}
 */
EventManager.prototype.getEventById = function (eventId) {
    "use strict";
    var i,
        event;
    for (i = 0; i < this._events.length; i++) {
        event = this._events[i];
        if (event.getId() === eventId) {
            return event;
        }
    }
};

/**
 * Return array of events, having all the tags, specified in arguments
 * @return {Array}
 */
EventManager.prototype.getEventsFilteredByTag = function () {
    var filtered_events = [],
        i,
        j,
        tag,
        event,
        matching_all_tags;
    for (i = 0; i < this._events.length; i++) {
        event = this._events[i];
        matching_all_tags = true;
        for (j = 0; j < arguments.length; j++) {
            tag = arguments[j];
            if (!event.hasTag(tag)) {
                matching_all_tags = false;
                break;
            }
        }
        if (matching_all_tags) {
            filtered_events.push(event);
        }
    }
    return filtered_events;
};


/**
 * Get array of previous events
 * @return {Array}
 */
EventManager.prototype.getPreviousEvents = function () {
    "use strict";
    var i,
        event,
        previous_events = [],
        now = new Date();
    for (i = 0; i < this._events.length; i++) {
        event = this._events[i];
        if (event.getEventDate() < now) {
            previous_events.push(event);
        } else {
            break; // can stop as this._events are sorted by due date
        }
    }
    return previous_events;
};

/**
 * Get array of future events
 * @return {Array}
 */
EventManager.prototype.getFutureEvents = function () {
    "use strict";
    var i,
        event,
        future_events = [],
        now = new Date();
    for (i = 0; i < this._events.length; i++) {
        event = this._events[i];
        if (event.getEventDate() > now) { // better yet to use binary search, but this is too complicated
            future_events.push(event);
        }
    }
    return future_events;
};

/**
 * Generate JSON representation of objects
 * @return {string}
 */
EventManager.prototype.dump = function () {
    "use strict";
    return JSON.stringify(eventManager, null, 4);
};






// ### Miscellaneous ###
// ########################################################################################################

function createGetter(propertyName) {
    function getProperty() {
        return this[propertyName];
    }
    return getProperty;
}

function createSetter(propertyName) {
    function setProperty(propertyValue) {
        this[propertyName] = propertyValue;
        return this;
    }
    return setProperty;
}


// ### Demonstration ###
// ########################################################################################################



var eventManager = new EventManager();

person1 = new Person("Oleg", "Golovin", "Valerievich", "ovgolovinBarkGmail.com");
person2 = new Person("Yan", "Romanikhin");
person3 = new Person("Anton", "Ivanov");


ev = new Event("Passed meeting");
ev.addTag("Archive").addTag("School");
date = new Date();
date.setDate(date.getDate() - 1);
ev.setEventDate(date);
ev.addPerson(person1).addPerson(person2);
eventManager.addEvent(ev);

ev = new Event("Future meeting 1");
ev.addTag("Important").addTag("School");
date = new Date();
date.setDate(date.getDate() + 1);
ev.setEventDate(date);
ev.addPerson(person2).addPerson(person3);
eventManager.addEvent(ev);

ev = new Event("Future meeting 2");
ev.addTag("waste_of_time").addTag("School");
date = new Date();
date.setDate(date.getDate() + 2);
ev.setEventDate(date);
ev.addPerson(person1).addPerson(person3);
eventManager.addEvent(ev);

ev = new Event("Future meeting to delete");
ev.addTag("delete");
date = new Date();
date.setDate(date.getDate() + 10);
ev.setEventDate(date);
eventManager.addEvent(ev);


console.log("Previous events:");
console.log(eventManager.getPreviousEvents());
console.log("Future events:");
console.log(eventManager.getFutureEvents());
console.log("With tag School:");
console.log(eventManager.getEventsFilteredByTag("School"));
console.log("With tags School and Imporant:");
console.log(eventManager.getEventsFilteredByTag("Important", "School"));

console.log("Deleting event (with delete tag).");
id = eventManager.getEventsFilteredByTag("delete")[0].getId();
eventManager.removeEvent(id);
console.log("Future events:");
console.log(eventManager.getFutureEvents());

console.log("Turning passed meeting into its sequel.");
ev = eventManager.getPreviousEvents()[0];
ev.setDescription("Sheer waste of time");
ev.setName("Second part of the meeting");
eventManager.removeEvent(ev.getId());
date = ev.getEventDate();
date = date.setDate(date.getDate() + 20);
ev.setEventDate(date);
eventManager.addEvent(ev);
console.log("Previous events:");
console.log(eventManager.getPreviousEvents());
console.log("Future events:");
console.log(eventManager.getFutureEvents());
