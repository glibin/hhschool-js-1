function Person(personInfo) {
    'use strict';
    this.firstName = personInfo.firstName;
    this.lastName = personInfo.lastName;
    if (personInfo.email !== undefined) {
        this.email = personInfo.email;
    }
    Person.prototype.id = Person.prototype.id + 1 || 1;
    this.id = Person.prototype.id;
}


function Event(eventInfo) {
    'use strict';
    Event.prototype.id = Event.prototype.id + 1 || 1;
    this.id = Event.prototype.id;
    this.creationDate = new Date();

    this.addTag = function (tag) {
        this.tags[tag] = true;
    };

    this.deleteTag = function (tag) {
        delete this.tags[tag];
    };

    this.addPerson = function (person) {
        this.persons[person.id] = person;
    };

    this.deletePerson = function (personId) {
        delete this.persons[personId];
    };

    this.getTags = function () {
        var result = [], tag;
        for (tag in this.tags) {
            if (this.tags.hasOwnProperty(tag)) {
                result.push(tag);
            }
        }
        return result;
    };

    this.hasTags = function (tags) {
        var i;
        for (i = 0; i < tags.length; i += 1) {
            if (!this.tags[tags[i]]) {
                return false;
            }
        }
        return true;
    };

    this.getPersons = function () {
        var result = [], person;
        for (person in this.persons) {
            if (this.persons.hasOwnProperty(person)) {
                result.push(this.persons[person]);
            }
        }
        return result;
    };

    this.tags = {};
    this.persons = {};

    this.updateAll = function (event) {
        var i, key;
        for (key in Event.prototype.allowedProperties) {
            if (Event.prototype.allowedProperties.hasOwnProperty(key)) {
                this[key] = eventInfo[key] || this[key];
            }
        }
        if (eventInfo.persons !== undefined) {
            for (i = 0; i < eventInfo.persons.length; i += 1) {
                this.addPerson(eventInfo.persons[i]);
            }
        }
        if (eventInfo.tags !== undefined) {
            for (i = 0; i < eventInfo.tags.length; i += 1) {
                this.addTag(eventInfo.tags[i]);
            }
        }

    };

    this.updateAll(eventInfo);
}

Event.prototype.allowedProperties = {"name" : true, "description" : true, "eventDate" : true};


function Calendar() {
    "use strict";
    this.events = {};
    this.addEvent = function (event) {
        this.events[event.id] = event;
    };

    this.deleteEvent = function (eventId) {
        delete this.events[eventId];
    };

    this.getPastEvents = function () {
        var now = new Date(), result = [], eventId;
        for (eventId in this.events) {
            if (this.events.hasOwnProperty(eventId)) {
                if (this.events[eventId].eventDate < now) {
                    result.push(this.events[eventId]);
                }
            }
        }
        return result;
    };

    this.getFutureEvents = function () {
        var now = new Date(), result = [], eventId;
        for (eventId in this.events) {
            if (this.events.hasOwnProperty(eventId)) {
                if (this.events[eventId].eventDate > now) {
                    result.push(this.events[eventId]);
                }
            }
        }
        return result;
    };

    this.filterByTag = function (tagList) {
        var result = [], eventId;
        for (eventId in this.events) {
            if (this.events.hasOwnProperty(eventId)) {
                if (this.events[eventId].hasTags(tagList)) {
                    result.push(this.events[eventId]);
                }
            }
        }
        return result;
    };
}

var person1 = new Person({firstName: "Johny", secondName : "Doe"});
var person2 = new Person({firstName: "Mickey", secondName : "Mouse", email : "mickey@mouse.com" });
var person3 = new Person({firstName: "Anonymous", secondName : "V", email : "v@example.com" });

var event1 = new Event({name: "epoch", description: "Epoch", eventDate: new Date(1970), persons: [person1, person2], tags: ["tag1", "tag2"]});
var event2 = new Event({name: "april", description: "April", eventDate: new Date(2013, 3), persons: [person3, person2], tags: ["tag2", "tag3"]});

var calendar = new Calendar();
calendar.addEvent(event1);
calendar.addEvent(event2);
