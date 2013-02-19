Array.prototype.remove = function (from, to) {
    'use strict';
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function Event(name) {
    'use strict';
    this.id = this.lastId;
    Event.prototype.lastId += 1;
    this.name = name;
    this.creationDate = new Date();
    this.tags = [];
    this.participants = [];
    this.setDate = function (date) {
        this.eventDate = date;
        return this;
    };
    this.setName = function (name) {
        this.name = name;
        return this;
    };
    this.setDescription = function (description) {
        this.description = description;
        return this;
    };
    this.addTag = function (tag) {
        if (!this.hasTag(tag)) {
            this.tags.push(tag);
        }
        return this;
    };
    this.hasTag = function (tag) {
        if (this.tags.indexOf(tag) !== -1) {
            return true;
        }
        return false;
    };
    this.addParticipant = function (participant) {
        this.participants.push(participant);
        return this;
    };
    this.removeTag = function (tag) {
        var index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.remove(index);
        }
        return this;
    };
}

Event.prototype.lastId = 0;


function EventManager() {
    'use strict';
    this.events = [];
    this.addEvent = function (event) {
        if (this.events[event.id] === undefined) {
            this.events[event.id] = event;
        }
        return this;
    };
    this.removeEvent = function (id) {
        if (this.events[id] !== undefined) {
            this.events.remove(id);
        }
        return this;
    };
    this.getEventsByTag = function (tag) {
        var i, result = [];
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                if (this.events[i].hasTag(tag)) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };
    this.getEvent = function (id) {
        return this.events[id];
    };
    this.getPassedEvents = function (tag) {
        var i, result = [];
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                if (this.events[i].eventDate <= new Date()) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };
    this.getFutureEvents = function (tag) {
        var i, result = [];
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                if (this.events[i].eventDate > new Date()) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };
}

function Participant(lastname, firstname, middlename, email) {
    'use strict';
    this.firstname = firstname || '';
    this.lastname = lastname || '';
    this.middlename = middlename || '';
    this.email = email || '';
    this.setMiddlename = function (middlename) {
        this.middlename = middlename;
        return this;
    };

    this.setFirstname = function (firstname) {
        this.firtsname = firstname;
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


}
var events = new EventManager();

var dummyUser1 = (new Participant("Иванов", "Иван", "Иванович", "ivan@ivanov.ru"));
var dummyUser2 = (new Participant("Сергеев", "Сергей", "Сергеевич", "sergey@sergeev.ru"));
var dummyUser3 = (new Participant("Иноземцев", "Александр", "Олегович", "a.inozemtsev@me.com"));

var dummyEvent1 = (new Event("Купить батон")).setDate(new Date("2015-10-20")).setDescription("Сходить в магазин и купить батон.").addParticipant(dummyUser1).addParticipant(dummyUser2);
var dummyEvent2 = (new Event("Купить молоко")).setDate(new Date("2011-10-20")).setDescription("Сходить в магазин и купить молоко.").addParticipant(dummyUser1).addParticipant(dummyUser2);
var dummyEvent3 = (new Event("Сдать домашнее задание по JS")).setDate(new Date("2013-02-19")).setDescription("Cоздать консольное приложение-календарь с возможностью добавлять/удалять события.").addParticipant(dummyUser3);

events.addEvent(dummyEvent1).addEvent(dummyEvent2).addEvent(dummyEvent3);


