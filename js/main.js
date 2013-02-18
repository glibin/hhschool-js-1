
/* I ignored some JSLint checks:
- unexpected '++', Why JSLint does not like ++?
- combine variable declaration with the previous 'var' statement */

// TODO: tests

/**
 * Member of event
 * @param source object with Member properties
 * @constructor
 */
function Member(source) {
    'use strict';

    this.name = source.name || '';
    this.lastName = source.lastName || '';

    this.patronymic = source.patronymic || '';
    this.email = source.email || '';

}

/**
 * Calendar event
 * @param source object with event properties
 * @constructor
 */
function Event(source) {
    'use strict';

    /**
     * Sets all keys of this to values of keys of source.
     * @param source
     */
    this.set = function (source) {

        var key;
        //noinspection JSLint,JSHint
        for (key in source) {
            this[key] = source[key];
        }

        this.name = this.name || '';
        this.description = this.description || '';

        this.tags = this.tags || [];
        // we could store tags in object instead of array
        // thus quickly determine whether event has or has not particular tag
        // but this is unnecessary optimisation:
        // we are not expect event to have many tags
        // so let's keep things simple

        this.members = this.members || [];

    };

    this.set(source);
    this.creationDate = new Date();

}

function compareEventsByDueDate(event1, event2) {
    'use strict';

    return event1.dueDate - event2.dueDate;

}

/**
 * Simple calendar - collection of events that can be added, edited, removed, get future/past, get by tag etc.
 * @constructor
 */
function Calendar() {
    'use strict';

    var events = []; // internal array of events
    //noinspection JSLint
    var nextEventId = 0;

    //noinspection JSLint
    /**
     * Adds event to the internal array and assigns id.
     * Do not maintain internal array sorted by due date.
     * @param extEvent event to add
     * @return {id} permanent id of added event
     */
    var addWithID = function (extEvent) {

        var intEvent = new Event(extEvent);
        intEvent.id = nextEventId;
        //noinspection JSLint
        nextEventId++;
        events.push(intEvent);
        return intEvent.id;

    };

    //noinspection JSLint
    /**
     * Sorts internal array of events by due date
     */
    var sortEventsByDueDate = function () {

        events.sort(compareEventsByDueDate);

    };

    /**
     * Adds event to the calendar.
     * @param extEvent event to add
     * @return {id} permanent id of the added event.
     */
    this.add = function (extEvent) {

        var eventID = addWithID(extEvent);

        // I think it is useful to keep events sorted by due date:
        // it is nice to show them sorted by due date
        // it is slightly faster to get future and past events
        sortEventsByDueDate();

        return eventID;

    };

    /**
     * Adds events to the calendar.
     * @param extEvents array of events to add
     * @return {Array} array of added events (careful! it is exactly the internal array of calendar events)
     */
    this.load = function (extEvents) {

        // add every external event to internal array of events
        events = [];
        var i;
        //noinspection JSLint
        for (i = 0; i < extEvents.length; i++) {
            addWithID(extEvents[i]);
        }

        // I mentioned above that it is useful to keep events sorted by due date.
        sortEventsByDueDate();

        // I do not know whether it is a javaScript style to return 'private' object
        // In java I would make a deep copy, but let's keep things simple
        return events;

    };

    //noinspection JSLint
    /**
     * Gets index of event in the internal array by event id.
     * @param id id of the event
     * @return {Number} index in the internal array
     */
    var getIndexOfEventById = function (id) {

        // of course it is long find by exhaustive search
        // if I used index in array as id - I would find at O(1)
        // but array index may change
        // and I wanted to keep id permanent
        // so I decided that exhaustive search is not so bad for learning task
        var i;
        //noinspection JSLint
        for (i = 0; i < events.length; i++) {
            if (events[i].id === id) {
                return i;
            }
        }

        return -1;

    };

    /**
     * Edits event with particular id.
     * @param id id of the event to edit.
     * @param newProps object with new event properties.
     * @return {Boolean} whether event was found by id and changed or not.
     */
    this.edit = function (id, newProps) {

        var index = getIndexOfEventById(id);
        if (index === -1) {
            return false;
        }

        events[index].set(newProps);

        // if dueDate was changed - maintain events in sorted order
        //noinspection JSLint
        if ('dueDate' in newProps) {
            sortEventsByDueDate();
        }

        return true;

    };

    /**
     * Removes event by id
     * @param id id of the event to remove
     * @return {Boolean} whether event was found and removed or not
     */
    this.remove = function (id) {

        var index = getIndexOfEventById(id);
        if (index === -1) {
            return false;
        }

        events.splice(index, 1);
        return true;

    };

    //noinspection JSLint
    /**
     * Gets index of first future event.
     * If there is no future event - returns index of past last element.
     * @return {index}
     */
    var getIndexOfFirstFutureEvent = function () {

        // gets index of first future event
        // if there is no future event - returns events.length

        var curDate = new Date();
        //noinspection JSLint
        var i;
        //noinspection JSLint
        for (i = 0; i < events.length; i++) {
            if (events[i].dueDate >= curDate) {
                break;
            }
        }

        return i;

    };

    /**
     * Returns array containing past events.
     * @return {Array}
     */
    this.getPast = function () {

        // our events are sorted by dueDate
        // thus to get past events we can make slice from the beginning to the first future event
        var i = getIndexOfFirstFutureEvent();
        return events.slice(0, i);

    };

    /**
     * Returns array containing future events.
     * @return {Array}
     */
    this.getFuture = function () {

        // our events are sorted by dueDate
        // thus to get future events we can make slice from the first future event to the end
        var i = getIndexOfFirstFutureEvent();
        return events.slice(i);

    };

    /**
     * Returns array of events that have one of the given tags
     * @param tags array of tags
     * @return {Array} array of found events
     */
    this.getByTags = function (tags) {

        var i, j;
        //noinspection JSLint
        var outEvents = [];
        //noinspection JSLint
        for (i = 0; i < events.length; i++) {

            //noinspection JSLint
            for (j = 0; j < tags.length; j++) {

                if (events[i].tags.indexOf(tags[j]) !== -1) {
                    outEvents.push(events[i]);
                    break;
                }

            }

        }

        return outEvents;

    };

}

var preparedData = [
    {
        name: 'Вторая лекция',
        description: 'Вторая лекция по js',
        dueDate: new Date(new Date().getFullYear() + 1, 0, 1, 17),
        tags: ['лекция', 'java script', 'hh', 'important'],
        members: [
            {
                name: 'Anton',
                lastName: 'Ivanov'
            },
            {
                name: 'Vitaly',
                lastName: 'Glibin'
            }
        ]
    },
    {
        name: 'Первая лекция',
        description: 'Первая лекция по js',
        dueDate: new Date(2013, 1, 11, 17, 0),
        tags: ['лекция', 'java script', 'hh']
    }
];

//noinspection JSLint,JSHint
var cal = new Calendar();
cal.load(preparedData);
//noinspection JSHint
console.log('Created predefined calendar cal and loaded sample data into it');
