/*jslint browser: true*/
/*global jQuery, Backbone, moment*/

(function ($, Underscore, Backbone, moment) {
    'use strict';

	/**
     * Calendar event model
     */
    var EventModel = Backbone.Model.extend({

        defaults: {

            name: '',
            description: '',
            due_date: undefined,
            tags: [],
			// TODO: review comments
            // we could store tags in object instead of array
            // thus quickly determine whether event has or has not particular tag
            // but this is unnecessary optimisation:
            // we are not expect event to have many

            members: [],
            creationDate: new Date()

        }

		/*// TODO: we can somehow use it with save method
        validate: function (attribs) {

            if (!attribs.name) {
                return 'Name is empty!';
            }

            if (!attribs.due_date) {
                return 'Due date is empty!';
            }

            return undefined;

        },

        urlRoot: '/events',

        initialize: function () {

            this.on('error', function (model, error) {
                //console.log(error);
            });

            this.on('change:name', function() {
                console.log(this.get('name'), 'changed name to', this.get('name'));
            });

            this.on('change:description', function() {
                console.log(this.get('name'), 'changed description to', this.get('description'));
            });

        }*/

    }),

    CalendarCollection = Backbone.Collection.extend({

        model: EventModel,

        comparator: function (eventModel) {
            return eventModel.get('due_date');
        },

        // TODO: localStorage
        //localStorage: new Backbone.LocalStorage('calendar-backbone'),

		/**
		 * Returns array containing events that happen in the given day
		 * @param month
		 * @param day
		 * @param year
		 * @returns {array}
		 */
		get_by_date: function(year, month, day) {

			return this.filter(function (eventModel) {

				var due_date = eventModel.get('due_date');
				return due_date.getFullYear() === year
					&& due_date.getMonth() === month
					&& due_date.getDate() === day;

			});

		},

        /**
         * Returns array of events that have one of the given tags
         * @param tags array of tags
         * @return {Array} array of found events
         */
        get_by_tags: function (tags) {

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

		/**
		 * Returns array containing past events.
		 * @return {Array}
		 */
		/*get_past: function () {

			var curDate = new Date();
			return this.filter(function (eventModel) {
				return eventModel.get('due_date') <= curDate;
			});

		},*/

		/**
		 * Returns array containing future events.
		 * @return {Array}
		 */
		/*get_future: function () {

			var curDate = new Date();
			return this.filter(function (eventModel) {
				return eventModel.get('due_date') > curDate;
			});

		},*/

    }),

	HeaderView = Backbone.View.extend({

		el: '#header',

		render: function () {

			var html = $('#header-template').html(),
				add_event_template_html = $('#add-event-template').html(),
				cur_date_text = moment().format('DD-MM-YYYY');

			this.$el.html(html);

			this.$add_event_button = this.$el.find('#add-event');
			this.$add_event_button.popover({
				placement: 'bottom',
				html: true,
				content: Underscore.template(add_event_template_html, {cur_date: cur_date_text})
			});

		},

		events: {
			'click #add-event__create': 'create_event'
		},

		create_event: function () {

			// TODO: validation

			var name = this.$el.find('#add-event__name').val(),
				date_text = this.$el.find('#add-event__date').val(),
				date = moment(date_text, 'DD-MM-YYYY').toDate(),
				event_model = new EventModel({name: name, due_date: date});

			this.collection.add(event_model);
			this.$add_event_button.popover('hide');
		}

	}),

    CellEventView = Backbone.View.extend({

        tagName: 'div',
        className: 'calendar-cell-event',
        cell_template: Underscore.template(document.getElementById('cell-event-template').innerHTML),
		popover_template: Underscore.template(document.getElementById('edit-event-template').innerHTML),

		initialize: function() {

			this.popover_visible = false;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);

		},

        render: function () {

            var model = this.model,

				name_formatted = model ? model.escape('name') : '',
				due_date = model ? model.get('due_date') : new Date(),
				due_date_formatted = moment(due_date).format('DD-MM-YYYY'),
				tags_formatted = model ? Underscore.escape(model.get('tags').join(', ')) : '',
				members_formatted = model ? Underscore.escape(model.get('members').join(', ')) : '',
				description_formatted = model ? model.escape('description') : '',

				cell_html = this.cell_template({
					name: name_formatted,
					members: members_formatted
				}),

				popover_html = this.popover_template({
					name: name_formatted,
					due_date: due_date_formatted,
					tags: tags_formatted,
					members: members_formatted,
					description: description_formatted,
					model: model
				});

            this.$el.html(cell_html);

			// TODO: we can do it later or even in the separate view
			this.$el.popover({
				placement: 'right',
				html: true,
				content: popover_html,
				container: this.$el,
				trigger: 'manual'
			});

			return this;

        },

		events: {
			'click .calendar-cell-event-wrapper': 'toggle_popover',
			'submit': 'save_model',
			//'click .save-event': 'save_model',
			'click .remove-event': 'destroy_model'
		},

		toggle_popover: function() {
			this.popover_visible ? this.$el.popover('hide') : this.$el.popover('show');
			this.popover_visible = !this.popover_visible;
		},

		save_model: function (event) {

			/*var eventDetails = {
				name: this.el.getE
			};
			if (!this.model) {
				this.model = new EventModel(eventDetails);
				this.collection.add(this.model);
			} else {
				this.model.set(eventDetails);
			}*/
			return false;

		},

		destroy_model: function () {
            this.model.destroy();
			return false;
        }

    }),

	// TODO: docstring
	date_of_last_monday = function(date) {

		var day = date.getDate();
		if (day === 0) {
			day = 7;
		}
		day -= 1;
		return new Date(date - day*24*60*60*1000);

	},

	names_of_days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],

    CalendarView = Backbone.View.extend({

        el: '#calendar-table',

		initialize: function() {
			this.listenTo(this.collection, 'add', this.render);
		},

        render: function () {
			// TODO: maybe some template?

			var cur_date = new Date(),
				date_counter = date_of_last_monday(cur_date),
				week_index, day_index, event_models,
				row, cell, cell_header;

			this.$el.empty();
			for (week_index=0; week_index < 5; week_index+=1) {

				row = document.createElement('tr');
				row.className = 'calendar-table-row';

				for (day_index=0; day_index < 7; day_index+=1) {

					cell = document.createElement('td');
					cell.className = 'calendar-cell';

					cell_header = document.createElement('div');
					cell_header.className = 'calendar-cell__header';
					cell_header.innerHTML = date_counter.getDate().toString();
					if (week_index === 0) {
						cell_header.innerHTML = names_of_days[day_index] + ', ' + cell_header.innerHTML;
					}
					cell.appendChild(cell_header);

					// TODO: ineffective
					event_models = this.collection.get_by_date(
						date_counter.getFullYear(),
						date_counter.getMonth(),
						date_counter.getDate());
					if (event_models.length > 0) {

						cell.classList.add('calendar-cell-with-events');

						event_models.forEach(function(event_model) {

							var event_view = new CellEventView({model: event_model});
							cell.appendChild(event_view.render().el);

						});

					}

					row.appendChild(cell);

					date_counter.setDate(date_counter.getDate()+1);

				}

				this.$el.append(row);

			}

            return this;

        }

    }),

    /*EditEventView = Backbone.View.extend({

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

    }),*/

    // predefined event 1 for demonstration
    eventModel1 = new EventModel({
        name: 'Первая лекция',
        description: 'Первая лекция по js',
        due_date: new Date(2013, 2, 16, 17),
        tags: ['лекция', 'java script', 'hh']
    }),

    // predefined event 2 for demonstration
    eventModel2 = new EventModel({
        name: 'Вторая лекция',
        description: 'Вторая лекция по js',
        due_date: new Date(2013, 2, 18, 17),
        tags: ['лекция', 'java script', 'hh', 'important'],
        members: ['Anton Ivanov', 'Vitaly Glibin']
    }),

    // predefined calendar
    calendarCollection = new CalendarCollection([eventModel1, eventModel2]);

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

	new HeaderView({collection: calendarCollection}).render();
	new CalendarView({collection: calendarCollection}).render();

	/**
	 * Member of event
	 * @param source object with Member properties
	 * @constructor
	 */
	/*function Member(source) {
		this.name = source.name || '';
		this.lastName = source.lastName || '';
		this.patronymic = source.patronymic || '';
		this.email = source.email || '';
	}*/

	/*Router = Backbone.Router.extend({

	 routes: {
	 '': 'home'
	 //'new': 'editEvent',
	 //'edit/:cid': 'editEvent'
	 },

	 home: function () {
	 // TODO: how long does this object live?
	 (new CalendarView({collection: calendarCollection})).render();
	 }

	 editEvent: function (cid) {
	 var eventModel = calendarCollection.get(cid);
	 // TODO: how long does this object live?
	 (new EditEventView({model: eventModel, collection: calendarCollection})).render();
	 }

	 }),

	router = new Router();

	Backbone.history.start(); */

}) (jQuery, _, Backbone, moment);

