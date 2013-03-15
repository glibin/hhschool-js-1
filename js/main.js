
(function ($, _, Backbone) {
    'use strict';

    /**
     * Member of event
     * @param source object with Member properties
     * @constructor
     */
    function Member(source) {
        this.name = source.name || '';
        this.lastName = source.lastName || '';
        this.patronymic = source.patronymic || '';
        this.email = source.email || '';
    }

    /**
     * Calendar event model
     */
    var EventModel = Backbone.Model.extend({

        defaults: {

            name: '',
            description: '',
            dueDate: undefined,
            tags: [],
            // we could store tags in object instead of array
            // thus quickly determine whether event has or has not particular tag
            // but this is unnecessary optimisation:
            // we are not expect event to have many

            members: [],
            creationDate: new Date()

        },

        // TODO: we can somehow use it with save method
        validate: function (attribs) {

            if (!attribs.name) {
                return 'Name is empty!';
            }

            if (!attribs.dueDate) {
                return 'Due date is empty!';
            }

            return undefined;

        },

        urlRoot: '/events',

        initialize: function () {

            /*this.on('error', function (model, error) {
                //console.log(error);
            });

            this.on('change:name', function() {
                console.log(this.get('name'), 'changed name to', this.get('name'));
            });

            this.on('change:description', function() {
                console.log(this.get('name'), 'changed description to', this.get('description'));
            });*/

        }

    }),

    CalendarCollection = Backbone.Collection.extend({

        model: EventModel,

        comparator: function (eventModel) {
            return eventModel.get('dueDate');
        },

        // TODO: localStorage
        //localStorage: new Backbone.LocalStorage('calendar-backbone'),

        /**
         * Returns array containing past events.
         * @return {Array}
         */
        getPast: function () {

            var curDate = new Date();
            return this.filter(function (eventModel) {
                return eventModel.get('dueDate') <= curDate;
            });

        },

        /**
         * Returns array containing future events.
         * @return {Array}
         */
        getFuture: function () {

            var curDate = new Date();
            return this.filter(function (eventModel) {
                return eventModel.get('dueDate') > curDate;
            });

        },

        /**
         * Returns array of events that have one of the given tags
         * @param tags array of tags
         * @return {Array} array of found events
         */
        getByTags: function (tags) {

            return this.filter(function (eventModel) {

                var j,
                    eventModelTags = eventModel.get('tags');
                for (j = 0; j < tags.length; j += 1) {

                    if (eventModelTags.indexOf(tags[j]) !== -1) {
                        return true;
                    }

                }

                return false;

            });

        }

    }),

    EventView = Backbone.View.extend({

        tagName: 'tr',
        className: 'eventContainer',
        template: _.template($('#event-template').html()),

        events: {
            'click .remove': 'destroyModel'
        },

        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {

            var modelJSON = this.model.toJSON();
            modelJSON.cid = this.model.cid;
            // TODO: show members properly
            var html = this.template(modelJSON);
            this.$el.html(html);
            return this;

        },

        destroyModel: function () {
            this.model.destroy();
        }

    }),

    CalendarView = Backbone.View.extend({

        el: '#page',
        compiledTemplate: _.template($('#calendar-template').html(), {}),

        render: function () {

            this.$el.html(this.compiledTemplate);
            var calendarBody = $('#calendar-body');

            _.each(this.collection.models, function(eventModel) {
                var eventView = new EventView({model: eventModel});
                calendarBody.append(eventView.render().el);
            });
            return this;

        }

        /*initialize: function() {
         // TODO: can we redraw only a model, not whole calendar?
         this.listenTo(this.model, 'change', this.render);
         }*/

    }),

    EditEventView = Backbone.View.extend({

        el: '#page',

        template: _.template($('#edit-event-template').html()),

        render: function () {

            // TODO: due date is not date!
            this.$el.html(this.template({eventModel: this.model}));
			$('.datepicker').datepicker({format: 'dd-mm-yyyy'});
            return this;

        },

        events: {
            'submit .edit-event-form': 'saveEvent',
            'click .delete': 'deleteEvent'
        },

        saveEvent: function (event) {

            var eventDetails = $(event.currentTarget).serializeObject();
            if (!this.model) {
                this.model = new EventModel(eventDetails);
                this.collection.add(this.model);
            } else {
                this.model.set(eventDetails);
            }
            router.navigate('', {trigger: true});
            return false;

        },

        deleteEvent: function (event) {
            this.model.collection.remove(this.model);
            router.navigate('', {trigger: true});
            return false;

        }

    }),

    // predefined event 1 for demonstration
    eventModel1 = new EventModel({
        name: 'Первая лекция',
        description: 'Первая лекция по js',
        dueDate: new Date(2013, 1, 11, 17, 0),
        tags: ['лекция', 'java script', 'hh']
    }),

    // predefined event 2 for demonstration
    eventModel2 = new EventModel({
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
            }]
    }),

    // predefined calendar
    calendarCollection = new CalendarCollection([eventModel1, eventModel2]),

    Router = Backbone.Router.extend({

        routes: {
            '': 'home',
            'new': 'editEvent',
            'edit/:cid': 'editEvent'
        },

        home: function () {
            // TODO: how long does this object live?
            (new CalendarView({collection: calendarCollection})).render();
        },

        editEvent: function (cid) {
            var eventModel = calendarCollection.get(cid);
            // TODO: how long does this object live?
            (new EditEventView({model: eventModel, collection: calendarCollection})).render();
        }

    }),

    router = new Router();

    Backbone.history.start();

    $.fn.serializeObject = function () {
        var o = {},
            a = this.serializeArray();
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

}) (jQuery, _, Backbone);

