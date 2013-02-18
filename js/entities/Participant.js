Zooble.Participant = function (firstName, lastName, patronymic, email) {
    var self = this;

    self.firstName = ko.observable(firstName);
    self.lastName = ko.observable(lastName);
    self.patronymic = ko.observable(patronymic);
    self.email = ko.observable(email);

    self.fullName = ko.computed(function () {
        var patronymicValue = !self.patronymic() ? "" : (" " + self.patronymic());
        return self.lastName() + " " + self.firstName() + patronymicValue;
    });
};