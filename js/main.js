Array.prototype.remove = function (from, to) {
    'use strict';
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
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
    this.clearParticipants = function () {
        this.participants = [];
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
    var p;
    var storage = JSON.parse(localStorage.getItem('events'));
    for (p in storage) {
        if (storage.hasOwnProperty(p)) {
            var event = new Event(storage[p].name).setDate(new Date(storage[p].eventDate)).setDescription(storage[p].description);
            event.tags = storage[p].tags;
            event.creationDate = new Date(storage[p].creationDate);
            event.participants = storage[p].participants;
            this.events.push(event);
        }
    }
    this.addEvent = function (event) {
        if (this.events[event.id] === undefined) {
            this.events[event.id] = event;
        }
        this.saveStorage();
        return this;
    };
    this.saveStorage = function () {
        localStorage.setItem('events', JSON.stringify(this.events));
    };
    this.removeEvent = function (id) {
        if (this.events[id] !== undefined) {
            this.events.remove(id);
        }
        this.saveStorage();
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
    this.getEvents = function () {
        return this.events;
    };
    this.getPassedEvents = function () {
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
    this.getDateEvents = function (date) {
        var i, result = [], begin = new Date(date.getTime()), end = new Date(date.getTime());
        begin.setHours(0);
        begin.setMinutes(0);
        begin.setSeconds(0);
        begin.setMilliseconds(0);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                if (begin <= this.events[i].eventDate && this.events[i].eventDate <= end) {
                    result.push(this.events[i]);
                }
            }
        }
        return result;
    };
    this.getFutureEvents = function () {
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

    this.getFullName = function () {
        return this.firstname + ' ' + this.lastname;
    }


}

function getCalendarDays(year, month) {
    'use strict'
    var days = [], today = new Date(year, month), first_day_in_month = new Date(today.getFullYear(), today.getMonth(), 1),
        first_day = first_day_in_month.getDay(), last_day_in_month = new Date(today.getFullYear(), today.getMonth() + 1, 0),
        last_day = last_day_in_month.getDay(), day;
    first_day = (first_day) ? first_day : 7;
    last_day = (last_day) ? last_day : 7;
    for (var i = 0; i < first_day - 1; i++) {
        day = (new Date(first_day_in_month));
        day.setDate(first_day_in_month.getDate() - first_day + 1 + i);
        days.push(day);
    }
    for (var i = 0; i < last_day_in_month.getDate(); i++) {
        day = (new Date(first_day_in_month));
        day.setDate(first_day_in_month.getDate() + i);
        days.push(day);
    }

    for (var i = last_day; i < 7; i++) {
        day = (new Date(last_day_in_month));
        day.setDate(last_day_in_month.getDate() + i - last_day + 1);
        days.push(day);
    }

    return days;
}
function drawCalendar(element, year, month) {
    var today = new Date(), current_row, current_month, week_days = ["Воскресение", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"], days = getCalendarDays(year, month);
    element.html("");
    if (year === today.getFullYear() && month === today.getMonth()) {
        current_month = true;
    } else {
        current_month = false;
    }
    for (i = 0; i < days.length; i++) {
        var output = $("<div class='day__date'>"+ days[i].getDate() + "</div>");
        var current_cell;
        if (i < 7) {
            output = $("<div class='day__date day__date-first'>" + week_days[days[i].getDay()] + ', ' + days[i].getDate() + "</div>");
        }
        var day_events = events.getDateEvents(days[i]);
        for (j = 0; j < day_events.length; j++) {
            event = $('<div class="event"><div class="event__name">' + day_events[j].name + '</div><div class="event__participate"></div></div>');
            participants_names = '';

            for (k = 0; k < day_events[j].participants.length; k++) {
                if (k > 0) participants_names += ', ';
                var participant = day_events[j].participants[k];
                participants_names += participant.firstname + ' ' + participant.lastname;
            }
            event.popover({content:
                '<div class="task-addition">' +
                    '<form class="popover-edition__form">' +
                    '<div>' + day_events[j].name + '</div>' +
                    '<div>' + moment(day_events[j].eventDate).format("LL") + '</div>' +
                    '<input type="text" class="task-addition__input" name="participants" value="' + participants_names +'" placeholder="Имена участников"/>' +
                    '<input type="hidden" name="id" value="' + day_events[j].id + '"> ' +
                    '<input type="hidden" name="date" value="' + moment(days[i]) + '">' +
                    '<textarea class="task-addition__input" name="description" rows="5">' + day_events[j].description + '</textarea>' +
                    '<input type="submit" value="Готово"/>' +
                    '<input type="reset" class="event-remove" value="Удалить"/></form></div>'
                , placement: 'right', trigger: 'manual', container: 'body', html: true});

            event.click(function(e){
                e.preventDefault();
                e.stopPropagation();
                $(this).popover("toggle");
            });
            event.find(".event__participate").html(participants_names);
            output.append(event);

        }

        if (i % 7 == 0) {
            current_row = $('<div class="day__row"></div>').appendTo(element);
        }
        current_cell = $('<div class="day__cell"><div class="day__item">' + '</div></div>');
        output.appendTo(current_cell.find('.day__item'));
        $(current_cell).find('.day__item').click(function (event) {
            $(this).parent().addClass('day__item-active');

        });
        $(current_cell).find('.day__item').popover({content:
            '<div class="task-addition">' +
                '<button  type="button" class="task-addition__close-button" onclick="$(this).parents(\'.popover\').prev().popover(\'hide\');"></button>' +
                '<form class="popover-addition__form">' +
                '<div>' +  moment(days[i]).format("LL") + '</div>' +
                    '<input type="text" class="task-addition__input" name="title" placeholder="Событие"/>' +
                    '<input type="text" class="task-addition__input" name="participants" placeholder="Имена участников"/>' +
                    '<input type="hidden" name="date" value="' + moment(days[i]) + '">' +
                    '<textarea class="task-addition__input" name="description" rows="5"></textarea>' +
                    '<input type="submit" value="Готово"/>' +
                    '</form></div>'
                                                , placement: 'right', trigger: 'click', html: true});
        $(current_cell).find('.day__item').on('hidden', function() {
            $(this).parent().removeClass('day__item-active');
        });

        $(current_cell).find('.day__item').on('shown', function(event) {
            $('.event').not($(event.target)).popover('hide');
            $('.day__item').not($(event.target)).popover('hide');
            $(".popover-addition__form").submit(function (event){
                event.preventDefault();
                form = $('.popover-addition__form').serializeObject();
                prt = form.participants.split(',');
                ev = new Event(form.title).setDate(new Date(parseInt(form.date))).setName(form.title).setDescription(form.description);
                for (l in prt) {
                    if (prt.hasOwnProperty(l)) {

                        names = prt[l].split(' ');
                        ev.addParticipant(new Participant(names[1], names[0]));
                    }
                }
                events.addEvent(ev);
                $('.day__item').popover('hide');

            });
            $(".popover-edition__form").submit(function (event){
                event.preventDefault();
                form = $('.popover-edition__form').serializeObject();
                prt = form.participants.split(',');
                ev = events.getEvent(parseInt(form.id));
                ev.clearParticipants();
                for (l in prt) {
                    if (prt.hasOwnProperty(l)) {
                        names = prt[l].split(' ');
                        ev.addParticipant(new Participant(names[1], names[0]));
                    }
                }
                ev.setDescription(form.description);
                $('.event').popover('hide');
                draw(moment(parseInt(form.date)).year(), moment(parseInt(form.date)).month());
            });
            $(".event-remove").click(function (event){
                event.preventDefault();
                form = $('.popover-edition__form').serializeObject();
                events.removeEvent(form.id);
                $('.event').popover('hide');

                draw(moment(parseInt(form.date)).year(), moment(parseInt(form.date)).month());


            });
        });


        if (current_month && days[i].getDate() == today.getDate()) {
            current_cell.addClass('day__item-current');
        }
        if (day_events.length > 0) {
            current_cell.addClass('day__item-with-events');
        }
        current_cell.appendTo(current_row);


    }
}

var events = new EventManager();
if (localStorage.getItem('events') === null) {
    var dummyUser1 = (new Participant("Иванов", "Иван", "Иванович", "ivan@ivanov.ru"));
    var dummyUser2 = (new Participant("Сергеев", "Сергей", "Сергеевич", "sergey@sergeev.ru"));
    var dummyUser3 = (new Participant("Иноземцев", "Александр", "Олегович", "a.inozemtsev@me.com"));

    var dummyEvent1 = (new Event("Купить батон")).setDate(new Date("2015-10-20")).setDescription("Сходить в магазин и купить батон.").addParticipant(dummyUser1).addParticipant(dummyUser2);
    var dummyEvent2 = (new Event("Купить молоко")).setDate(new Date("2011-10-20")).setDescription("Сходить в магазин и купить молоко.").addParticipant(dummyUser1).addParticipant(dummyUser2);
    var dummyEvent3 = (new Event("Сдать домашнее задание по JS")).setDate(new Date("2013-02-19")).setDescription("Cоздать консольное приложение-календарь с возможностью добавлять/удалять события.").addParticipant(dummyUser3);

    events.addEvent(dummyEvent1).addEvent(dummyEvent2).addEvent(dummyEvent3);
}


function draw(year, month) {
    var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    $('.month-selector__month').html(months[month]);
    $('.month-selector__year').html(year);
    events.saveStorage();
    drawCalendar($('.day'), year, month);
}

function redraw() {
    draw(current.getFullYear(), current.getMonth());
}

$(".header__button-add").popover({content: '<div class="task-addition">' +
    '<button  type="button" class="task-addition__close-button" onclick="$(\'.header__button-add\').popover(\'hide\');"></button>' +
    '<form class="task-addition__form">' +
    '<input type="text" class="task-addition__input" placeholder="5 марта, 14:00, День рождения"/>' +
    '<input type="submit" value="Создать"/>' +
    '</form></div>', placement: 'bottom', trigger: 'click', html: true});

$(".header__button-add").on('shown', function(event){
$(".task-addition__form").submit(function (event){
    event.preventDefault();
    var values = $('.task-addition__input').val().split(",");
    for (var i = 0; i < values.length; i++) {

        values[i] = $.trim(values[i]);
    }
    var date = moment(values[0], 'DD MMM', 'ru');
    date.year(moment().year());
    date.hours(moment(values[1], 'HH:mm', 'ru').hours());
    date.minutes(moment(values[1], 'HH:mm', 'ru').minutes());
    events.addEvent((new Event("Купить батон")).setDate(new Date(date.valueOf())).setName(values[2]));
    $('.header__button-add').popover('hide');
    draw(date.year(), date.month());

});});

var current = new Date();
$(document).ready(function(){
    draw(current.getFullYear(), current.getMonth());
});
$('.month-selector__button-left').click(function (){
    current.setMonth(current.getMonth() - 1);
    draw(current.getFullYear(), current.getMonth());
});
$('.month-selector__button-right').click(function (){
    current.setMonth(current.getMonth() + 1);
    draw(current.getFullYear(), current.getMonth());
});
$('.month-selector__button-today').click(function (){
    current = new Date();
    draw(current.getFullYear(), current.getMonth());
});


$( ".header-search__input" ).typeahead({
    source: function(query, process) {
    var results = $.map(events.getEvents(), function(product) {
        return product.id;
    });
    process(results);
    },
    matcher: function (item) {
        if (events.events[item].name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1){
            return true;
        }
        return false;
    },
    sorter: function (items) {
        return items;
    },
    highlighter: function (item) {
        console.log(item);
        return "<div>"+ events.events[item].name +"</div><div>" +  moment(events.events[item].eventDate).format("LL") + "</div>";
    },
    updater: function (item) {
        draw(events.events[item].eventDate.getFullYear(), events.events[item].eventDate.getMonth());
        return events.events[item].name;
    }
});