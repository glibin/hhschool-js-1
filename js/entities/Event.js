Zooble.Event = function (id, name, creationDate, date, tags, description, participants) {
    var self = this;

    self.id = id;
    self.name = ko.observable(name);
    self.creationDate = ko.observable(creationDate);
    self.date = ko.observable(date);
    self.tags = ko.observableArray(tags);
    self.description = ko.observable(description);
    self.participants = ko.observableArray(participants);

    self.prettyEventDate = ko.computed(function () {
        return !self.date() ? null : self.date().toDateString();
    });
};