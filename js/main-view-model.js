Zooble.MainViewModel = (function (dataProvider, Event, Participant, util) {
    return function (events) {
        var self = this;

        self.events = ko.observableArray(events);

        this.selectedEvent = ko.observable();
        self.originalEvent = null;
        self.saveFunc = null;
        self.cancelFunc = null;

        self.eventByDateFilters = {
            all : function (event) {
                return true;
            },
            past : function (event) {
                return event.date() < new Date();
            },
            upcoming : function (event) {
                return event.date() > new Date();
            }
        };

        self.eventsByDateFilter = ko.observable("all");

        self.filteringTags = ko.observableArray([]);

        self.eventsFilters = ko.computed(function () {
            return {
                date : self.eventByDateFilters[self.eventsByDateFilter()],
                tags : function (event) {
                    if (self.filteringTags().length == 0) {
                        return true;
                    }
                    return util.all(self.filteringTags(), function (filteringTag) {
                        return ko.utils.arrayIndexOf(event.tags(), filteringTag) != -1;
                    });
                }
            };
        });

        self.filteredEvents = ko.computed(function () {
            var sortedEvents = self.events().sort(function (e1, e2) {
                return e2.creationDate() - e1.creationDate();
            });
            return ko.utils.arrayFilter(sortedEvents, function (event) {
                return util.all(self.eventsFilters(), function (eventFilter) {
                    return eventFilter(event);
                });
            });
        });

        self.allTags = ko.computed(function () {
            return self.filteredEvents().reduce(function (tags, event) {
                return ko.utils.arrayGetDistinctValues(tags.concat(event.tags())).sort();
            }, [])
        });

        self.eventTemplate = function (item) {
            return item === self.selectedEvent() ? "eventEditTemplate" : "eventDisplayTemplate";
        };

        self.addEvent = function () {
            var newEvent = new Event(-1, "new event", new Date(), new Date(), [], "event description", []);
            self.selectedEvent(newEvent);
            self.saveFunc = self.saveAdd;
            self.cancelFunc = self.cancelAdd;
            self.events.unshift(newEvent);
        };

        self.saveAdd = function (event) {
            dataProvider.saveEvent(event);
            self.selectedEvent(null);
        };

        self.cancelAdd = function (event) {
            self.events.remove(event);
            self.selectedEvent(null);
        };

        self.editEvent = function (event) {
            self.originalEvent = ko.utils.clone(event);
            self.saveFunc = self.saveEdit;
            self.cancelFunc = self.cancelEdit;
            self.selectedEvent(event);
        };

        self.saveEdit = function (event) {
            dataProvider.editEvent(event);
            self.selectedEvent(null);
        };

        self.cancelEdit = function (event) {
            self.selectedEvent(null);
            self.events.replace(event, self.originalEvent);
        };

        self.removeEvent = function (event) {
            dataProvider.removeEvent(event);
            self.events.remove(event);
            self.selectedEvent(null);
        };
    }
})(Zooble.dataProvider, Zooble.Event, Zooble.Participant, Zooble.util);