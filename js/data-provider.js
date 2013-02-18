Zooble.dataProvider = (function (JSON, localStorage, entityJsonBuilder) {
    var eventsKey = "Zooble.events";
    var eventsAutoincrementKey = "Zooble.events.autoincrement";

    function getEvents() {
        return JSON.parse(localStorage.getItem(eventsKey));
    }

    function getEvent(eventsData, event) {
        return ko.utils.arrayFirst(eventsData, function (storedEvent) {
            return storedEvent.id === event.id;
        });
    }

    function saveEvents(events) {
        localStorage.setItem(eventsKey, JSON.stringify(ko.mapping.toJS(events)));
    }

    return {
        loadEvents : function () {
            var eventsData = getEvents();
            if (!eventsData) {
                return null;
            }
            var events = [];
            for (var i = 0; i < eventsData.length; i++) {
                events.push(entityJsonBuilder.build("Event", eventsData[i]))
            }
            return events;
        },
        editEvent : function (event) {
            var eventsData = getEvents();
            var storedEvent = getEvent(eventsData, event);
            ko.utils.arrayRemoveItem(eventsData, storedEvent);
            eventsData.push(ko.mapping.toJS(event));
            saveEvents(eventsData);
        },
        saveEvent : function (event) {
            var eventsData = getEvents() || [];
            var autoIncrement = parseInt(localStorage.getItem(eventsAutoincrementKey)) + 1;
            event.id = autoIncrement;
            localStorage.setItem(eventsAutoincrementKey, autoIncrement);
            eventsData.push(ko.mapping.toJS(event));
            saveEvents(eventsData);
        },
        saveEvents : function (events) {
            var autoIncrement = events.reduce(function(maxId, event) {
                return event.id > maxId ? event.id : maxId;
            }, 0);
            localStorage.setItem(eventsAutoincrementKey, autoIncrement);
            saveEvents(events);
        },
        removeEvent : function (event) {
            var eventsData = getEvents();
            var storedEvent = getEvent(eventsData, event);
            ko.utils.arrayRemoveItem(eventsData, storedEvent);
            saveEvents(eventsData);
        }
    }
})(JSON, localStorage, Zooble.entityJsonBuilder);