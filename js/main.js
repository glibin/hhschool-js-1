/*globals alert, console, _, $, Store, Backbone*/

$(function () {
    'use strict';
    $("#eventDate").datepicker();
});

var Calendar = {
    Models: {},
    Collections: {},
    Views: {},
    Templates: {}
};

Calendar.Models.Person = Backbone.Model.extend({
    defaults: {
        name: '',
        surname: ''
    }
});

Calendar.Models.Event = Backbone.Model.extend({});

var Events = Backbone.Collection.extend({
    model: Calendar.Models.Event,

    localStorage: new Store('calendar'),

    comparator: function (item) {
        'use strict';
        return item.get('eventDate');
    }
});
Calendar.Collections.Events = new Events();


Calendar.Views.EventView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#item-template').html()),

    events: {
        'click span.remove-event': 'clear',
        'dblclick td.eventDate': 'editDate',
        'dblclick td.description': 'editText'
    },

    initialize: function () {
        'use strict';
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
    },

    render: function () {
        'use strict';
        $(this.el).html(this.template(this.model.toJSON()));

        this.descriptionInput = this.$('.description-input');
        this.descriptionInput.bind('blur', _.bind(this.closeText, this));
        this.descriptionInput.val(this.model.get('description'));

        this.eventDateInput = this.$('.event-date-input');
        this.eventDateInput.val($.datepicker.formatDate('yy-mm-dd', this.model.get('eventDate')));

        return this;
    },

    editDate: function () {
        'use strict';
        $('.eventDate', this.el).addClass('editing');
        var that = this;
        $('.event-date-input', this.el).datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function () {
                that.model.save({eventDate: $('.event-date-input', that.el).datepicker('getDate')});
                $(".eventDate", that.el).removeClass("editing");
            }
        });
        this.eventDateInput.focus();
    },

    editText: function () {
        'use strict';
        $('.description', this.el).addClass('editing');
        this.descriptionInput.focus();
    },

    closeText: function () {
        'use strict';
        this.model.save({description: this.descriptionInput.val()});
        $(".description", this.el).removeClass("editing");
    },

    remove: function () {
        'use strict';
        $(this.el).remove();
    },

    clear: function () {
        'use strict';
        this.model.destroy();
    }
});


Calendar.Views.MainView = Backbone.View.extend({
    el: $('#calendar'),

    past: false,

    events: {
        'click .row .span4 input': 'newEvent',
        'click #cancel': 'cancel',
        'click #create': 'create',
        'click #showPast': 'filter',
        'click #showFuture': 'filter'
    },

    initialize: function () {
        'use strict';
        Calendar.Collections.Events.bind('add', this.add, this);
    },

    newEvent: function () {
        'use strict';
        $('#eventList').hide();
        $('#filter').hide();
        $('#newEvent').show();
        $('#newEventButton').hide();
    },

    cancel: function () {
        'use strict';
        $('#filter').show();
        $('#newEvent').hide();
        $('#eventList').show();
        $('#newEventButton').show();
    },

    create: function () {
        'use strict';
        var eventDate = $('#eventDate').datepicker('getDate'), creationDate = new Date(),
            description = $('#eventDescription').val(), name = $('#eventName').val();
        if (eventDate && description) {
            Calendar.Collections.Events.create({
                eventDate: eventDate,
                creationDate: creationDate,
                name: name,
                description: description
            });
            this.cancel();
            this.filter();
        }
    },

    add: function (event) {
        'use strict';
        var view = new Calendar.Views.EventView({ model: event });
        this.$('#eventList').append(view.render().el);
    },

    filter: function () {
        'use strict';
        this.$('#eventList').find("tr:gt(0)").remove();
        var past = $('#showPast').prop("checked"), future = $('#showFuture').prop("checked");
        var lam = function (event) {
            var pastCond = event.get("eventDate") < event.get("creationDate") ? past : false;
            var futureCond = event.get("eventDate") >= event.get("creationDate") ? future : false;
            return pastCond || futureCond;
        };
        _.each(Calendar.Collections.Events.filter(lam), this.add.bind(this));
    }
});

var view = new Calendar.Views.MainView();

Calendar.Collections.Events.create({
    eventDate: new Date("2013-02-26"),
    creationDate: new Date(),
    description: "какое-то время",
    name: "Прокастинировать"
});


Calendar.Collections.Events.create({
    eventDate: new Date(),
    creationDate: new Date(),
    description: "Сейчас!",
    name: "Прекратить прокрастинацию"
});

Calendar.Collections.Events.create({
    eventDate: new Date("2013-02-28"),
    creationDate: new Date(),
    description: "Прямо сейчас!",
    name: "Прекратить прокрастинацию"
});