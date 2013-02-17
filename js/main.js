/*
Каждое событие должно иметь:

+ название,
+ дату создания,
+ дату события,
+ набор тегов,
+ описание,
+- список участников.
Участник должен иметь следующие свойства:

- имя,
- фамилия,
- отчество (необязательно),
- email (необязательно).
Приложение должно уметь:

+ получать список будущих событий,
+ список прошедших событий,
+ возможность удалять событие (по id),
+ возможность создавать событие,
- возможность редактировать событие,
+ фильтрация по тегам
Не забыть иметь список предустановленных событий, чтобы быстро проверить работоспособность приложения.

Основной код приложения должен находиться в файле js/main.js (он уже подключен в index.html)
*/
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Event.prototype.lastId = 0;

function Event (name) {
    'use strict';
    this.id = this.lastId;
    Event.prototype.lastId++;
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
        if (this.tags.indexOf(tag) != -1) {
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
        if (index != -1) {
            delete this.tags.remove(index);
        }
        return this;
    };
}

function EventManager () {
    this.events = [];
    this.addEvent = function (event) {
        if (this.events[event.id] == undefined) {
            this.events[event.id] = event;
        }
        return this;
    };
    this.removeEvent = function (id) {
        if (this.events[id] != undefined) {
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

events = new EventManager();
events.addEvent((new Event("test1")).setDate(new Date("2015-10-20")).setDescription("test1 description"));




