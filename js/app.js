(function (entityJsonBuilder, dataProvider, Event, Participant, MainViewModel) {
    function registerEntityJsonBuilders() {
        entityJsonBuilder.registerBuilder("Event", function (json) {
            var id = json.id;
            var name = json.name;
            var creationDate = new Date(json.creationDate);
            var date = new Date(json.date);
            var tags = json.tags;
            var description = json.description;
            var participants = [];
            for (var i = 0; i < json.participants.length; i++) {
                participants.push(entityJsonBuilder.build("Participant", json.participants[i]));
            }
            return new Event(id, name, creationDate, date, tags, description, participants);
        });
        entityJsonBuilder.registerBuilder("Participant", function (json) {
            var firstName = json.firstName;
            var lastName = json.lastName;
            var patronymic = json.patronymic;
            var email = json.email;
            return new Participant(firstName, lastName, patronymic, email);
        });
    }

    function loadSampleEventsData() {
        return [
            new Event(1, "js hw1", new Date(2013, 1, 9), new Date(2013, 1, 15), ["js", "hw", "events manager", "project"], "make simple events manager", [
                new Participant("Andrey", "Yankovsky", "Valentinovich", "YankovskyAndrey@gmail.com")
            ]),
            new Event(2, "next lecture on js", new Date(2013, 1, 10), new Date(2013, 1, 20), ["js", "lecture"], "upcoming lecture", [
                new Participant("Andrey", "Yankovsky", "Valentinovich", "YankovskyAndrey@gmail.com"),
                new Participant("Emil", "Lerner", null, "neex.emil@gmail.com"),
                new Participant("Vitaly", "Glibin", null, "glibin.v@gmail.com")
            ]),
            new Event(3, "first lecture on js", new Date(2013, 1, 1), new Date(2013, 1, 11), ["js", "lecture"], "passed lecture", [
                new Participant("Andrey", "Yankovsky", "Valentinovich", "YankovskyAndrey@gmail.com"),
                new Participant("Андрей", "Янковский", "Валентинович", "YankovskyAndrey@gmail.com"),
                new Participant("Emil", "Lerner", null, "neex.emil@gmail.com"),
                new Participant("Vitaly", "Glibin", null, "glibin.v@gmail.com")
            ]),
            new Event(4, "course.ru meeting on architecture", new Date(2013, 1, 5), new Date(2013, 1, 14), ["course.ru", "project"], "create Coursera analog with some added functionality", [
                new Participant("Andrey", "Yankovsky", "Valentinovich", "YankovskyAndrey@gmail.com"),
                new Participant("Andrey", "Rybintsev", null, "avrybintsev@gmail.com"),
                new Participant("Petr", "Bolotov", null, "pvbolotov1@gmail.com"),
                new Participant("Vasily", "Slesarev", null, "vasily.slesarev@gmail.com"),
                new Participant("Vasily", "Katraev", null, "vkatraev@gmail.com")
            ])
        ];
    }

    function getEvents() {
        var events = dataProvider.loadEvents();
        if (events.length == 0) {
            events = loadSampleEventsData();
            dataProvider.saveEvents(events);
        }
        return events;
    }

    registerEntityJsonBuilders();
    var events = getEvents();
    ko.applyBindings(new MainViewModel(events));

})(Zooble.entityJsonBuilder, Zooble.dataProvider, Zooble.Event, Zooble.Participant, Zooble.MainViewModel);