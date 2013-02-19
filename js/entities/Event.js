Zooble.Event = function (id, name, creationDate, date, tags, description, participants) {
    var self = this;

    self.id = id;
    self.name = ko.observable(name);
    self.creationDate = ko.observable(creationDate);
    self.date = ko.observable(date);
    self.tags = ko.observableArray(tags);
    self.description = ko.observable(description);
    self.participants = ko.observableArray(participants);

    self.prettyEventDate = ko.computed({
        read : function () {
            var eventDate = self.date();
            if (!eventDate) {
                return null;
            }
            var day = eventDate.getDate();
            var month = eventDate.getMonth() + 1;
            var year = eventDate.getFullYear();
            return day + "." + month + "." + year;
        },
        write : function (newPrettyEventDateValue) {
            var dateParts = newPrettyEventDateValue.split(".");
            var day = parseInt(dateParts[0]);
            var month = parseInt(dateParts[1]) - 1;
            var year = parseInt(dateParts[2]);
            self.date(new Date(year, month, day))
        }
    });

    self.tagsCsv = ko.computed({
        read : function () {
            return self.tags().join(",");
        },
        write : function (newTagsCsv) {
            self.tags(newTagsCsv.split(","));
        }
    });

    self.addParticipant = function () {
        self.participants.push(new Zooble.Participant());
    };

    self.deleteParticipant = function (participant) {
        self.participants.remove(participant);
    };
};