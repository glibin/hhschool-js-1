eventCounter = 0;

function Participant() {
    'use strict';

    // Participant's name
    this.name = '';

    // Participant's surname
    this.surname = '';

    // Participant's lastname
    this.lastname = '';

    // Participant's email
    this.email = '';

    /* setters */

    this.setName = function (name) {
        this.name = name;
        return this;
    };

    this.setSurname = function (surname) {
        this.surname = surname;
        return this;
    };

    this.setLastname = function (lastname) {
        this.lastname = lastname;
        return this;
    };

    this.setEmail = function (email) {
        this.email = email;
        return this;
    };

    this.setAll = function (name, surname, lastname, email) {
        this.name = name || '';
        this.surname = surname || '';
        this.lastname = lastname || '';
        this.email = email || '';
        return this;
    };

}

function Event() {
    'use strict';

    // Event ID
    this.id = ++eventCounter;

    // Event title
    this.title = '';

    // Event list of tags
    this.tags = [];

    // Event list of participants
    this.participants = [];

    // Event creation date
    this.systemDate = new Date();

    // Event date
    this.eventDate = new Date();

    // Event description
    this.description = '';

    /* setters */

    this.setTitle = function (title) {
        this.title = title;
        return this;
    };

    this.setEventDate = function (eventDate) {
        this.eventDate = eventDate;
        return this;
    };

    this.setDescription = function (description) {
        this.description = description;
        return this;
    };

    /* handling tags */

    this.tagIndex = function (tag) {
        return this.tags.indexOf(tag);
    };

    this.tagExists = function (tag) {
        if (this.tagIndex(tag) >= 0) {
            return true;
        }
        return false;        
    };

    this.addTag = function (tag) {
        if (!this.tagExists(tag)) {
            this.tags.push(tag);
        }
        return this;
    };

    this.removeTag = function (tag) {
        var index = this.tagIndex(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
        return this;
    };

    /* handling participants */

    this.addParticipant = function (participant) {
        this.participants.push(participant);
        return this;
    };

    /* edit event */
    this.updateEvent = function (params) {
        for (var key in params) {
            if (this.hasOwnProperty(key)) {
                this[key] = params[key];
            }
        }
        return this;
    };
}

function EventManager() {
    'use strict';

    // List of events
    this.eventList = {};

    /* handling events */

    this.addEvent = function (event) {
        this.eventList[event.id] = event;
        return this;
    };

    this.removeEventByID = function (id) {
        if (this.eventList[id]) {
            delete this.eventList[id];
        }
        return this;
    };

    this.getEventByID = function (id) {
        return this.eventList[id];
    };

    // filter by tag
    this.getEventsByTag = function (tag) {
        var result = [];
        for (var item in this.eventList) if (this.eventList.hasOwnProperty(item)) {
            if (this.eventList[item].tagExists(tag)) {
                result.push(this.eventList[item]);
            }
        }
        return result;
    };

    // Less or equal comparator
    var lte = function (a, b) {
        return a <= b;
    };

    // Greater comparator
    var gt = function (a, b) {
        return a > b;
    };

    // Events filter by date
    this.getEvents = function (comparator) {
        var result = [];
        for (var item in this.eventList) if (this.eventList.hasOwnProperty(item)) {
            if (comparator(this.eventList[item].eventDate, new Date())) {
                result.push(this.eventList[item]);
            }
        }
        return result;
    };

    /* getters */

    this.getPastEvents = function () {
        return this.getEvents(lte);
    };

    this.getFutureEvents = function (tag) {
        return this.getEvents(gt);
    };
}

eventManager = new EventManager();

/* Some events for testing purposes */

participant1 = (new Participant()).setAll('Name1', 'Surname1', null, 'test@example.com')
participant2 = (new Participant()).setAll('Name2', 'Surname2', 'Lastname2', 'test@example')

testEvent1 = (new Event()).setTitle('test event 1').setEventDate(new Date("2013-02-18")).addTag('1').addParticipant(participant1);
testEvent2 = (new Event()).setTitle('test event 2').setEventDate(new Date("2013-02-19")).addTag('2').addParticipant(participant2);

eventManager.addEvent(testEvent1);
eventManager.addEvent(testEvent2);

/*
testEvent1.updateEvent({title:'test update'})
testEvent2.updateEvent({title:'test update again', lol:0, tags:['tag1','tag2','tag3']})
eventManager.getPastEvents()
eventManager.getFutureEvents()
eventManager.getEventsByTag('1')
eventManager.getEventsByTag('2')
eventManager.getEventsByTag('3')
*/