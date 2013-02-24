function Person(person) {
    'use strict';
    this.firstName = person.firstName;
    this.lastName = person.lastName;
    if (person.patronymic !== undefined) {
        this.email = person.patronymic;
    }
    if (person.email !== undefined) {
        this.email = person.email;
    }
    Person.prototype.id = Person.prototype.id + 1 || 1;
    this.id = Person.prototype.id;
}

function Event(name, description, eventDate, persons, tags) {
    'use strict';
    this.name = name;
    this.creationDate = new Date();
    this.eventDate = eventDate;
    this.setEventDate = function (eventDate) {
        this.eventDate = eventDate;
    };
    this.tags = tags;
    this.hasTag = function (tag) {
        var i = 0;
        for (i; i < this.tags.length; i += 1) {
            if (this.tags[i] === tag) {
                return true;
            }
        }
        return false;
    };
    this.addTag = function (tag) {
        if (!this.hasTag(tag)) {
            tags.push(tag);
        }
    };

    this.removeTag = function (tag) {
        var i = 0;
        for (i; i < this.tags.length; i += 1) {
            if (tags[i] === tag) {
                delete tags[i];
                return true;
            }
        }
    };

    this.description = description;

    this.setDescription = function (description) {
        this.description = description;
    };

    this.persons = persons;

    this.hasPerson = function (person) {
        var i = 0;
        for (i; i < this.persons.length; i += 1) {
            if (persons[i] === person) {
                return true;
            }
        }
        return false;
    };

    this.addPerson = function (person) {
        if (!this.hasPerson(person)) {
            this.persons.push(person);
        }
    };

    Event.prototype.id = Event.prototype.id + 1 || 1;
    this.id = Event.prototype.id;
}

function Calendar() {
    'use strict';

    this.events = [];

    this.getFutureEvents = function () {
        var i = 0, curTime = new Date(), result = [];
        for (i; i < this.events.length; i += 1) {
            if (this.events[i] !== undefined) {
                if (this.events[i].eventDate > curTime) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };

    this.getExpiredEvents = function () {
        var i = 0, curTime = new Date(), result = [];
        for (i; i < this.events.length; i += 1) {
            if (this.events[i] !== undefined) {
                if (this.events[i].eventDate <= curTime) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };

    this.deleteEvent = function (id) {
        delete this.events[id];
    };

    this.addEvent = function (event) {
        this.events.push(event);
    };

    this.getFilteredList = function (tags) {
        var i = 0, j = 0, has_tags = true, result = [];
        for (i; i < this.events.length; i += 1) {
            has_tags = true;
            for (j = 0; j < tags.length; j += 1) {
                if (!this.events[i].hasTag(tags[j])) {
                    has_tags = false;
                    break;
                }
            }
            if (has_tags) {
                result.push(this.events[i]);
            }
        }
        return result;
    };

}

var person1 = new Person({firstName: "Abram", secondName : "Abramson"});
var person2 = new Person({firstName: "Bob", secondName : "Bobson", patronymic : "Bpater" });
var person3 = new Person({firstName: "Claud", secondName : "Claudson", email : "claud@mail.com" });
var person4 = new Person({firstName: "Dick", secondName : "Dickson", patronymic : "Dpater", email : "dick@mail.com" });
var person5 = new Person({firstName: "Elton", secondName : "Eltonson", patronymic : "Epater", email : "elton@mail.com" });

var event1 = (new Event("Event1", "doEvent1", new Date("2013-02-11"), [person1] , ['tag1']));
var event2 = (new Event("Event2", "doEvent2", new Date("2013-02-12"), [person2] , ['tag1', 'tag2']));
var event3 = (new Event("Event3", "doEvent3", new Date("2013-02-13"), [person3, person4] , ['tag3', 'tag4']));
var event4 = (new Event("Event4", "doEvent4", new Date("2013-02-27"), [person3, person4, person5] , ['tag5']));

var calendar = new Calendar();
calendar.addEvent(event1);
calendar.addEvent(event2);
calendar.addEvent(event3);
calendar.addEvent(event4);
