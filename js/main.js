/*jslint browser: true*/
/*global jQuery, Backbone, _, moment, alert*/

(function ($, Underscore, Backbone, moment) {
    'use strict';

    var EventModel = Backbone.Model.extend({

        defaults: {

            name: '',
            description: '',
            dueDate: undefined,
            tags: [],
            members: [],
            creationDate: new Date()

        },

        initialize: function () {

            this.on('change', function() {
                this.save();
            });

            // TODO: this is better be on view side
            this.on('invalid', function (model, error) {
                alert(error);
             });

        },

        parse: function(data) {

            // in JSON dates comes as text, we need to convert them
            data.dueDate = new Date(data.dueDate);
            data.creationDate = new Date(data.creationDate);
            return data;

        },

        /**Earliest date that makes sense as due date of a model.
         * Prevents user to specify wrong date.*/
        earliestDueDate: new Date(1990, 0, 1),

        /**Latest date that makes sense as due date of a model.
         * Prevents user to specify wrong date.*/
        latestDueDate: new Date(new Date().getFullYear()+10, 0, 1),

        validate: function (attributes) {

            if (!attributes.name.trim()) {
                return 'Name is empty!';
            }

            if (!attributes.dueDate) {
                return 'Due date is empty!';
            }

            if (attributes.dueDate < this.earliestDueDate || attributes.dueDate > this.latestDueDate) {
                return 'Due date seems to be too far away from now!';
            }

            return undefined;

        },

        /**Returns true or false whether a model suits query string or not.
         * @param query query string
         * @returns boolean*/
        suitsQuery: function(query) {

            var containsQuery = function(str) {
                    return str.indexOf(query) !== -1;
                };

            if (this.get('name').indexOf(query) !== -1) {
                return true;
            }

            if (this.get('description').indexOf(query) !== -1) {
                return true;
            }

            // TODO: dueDate

            if (this.get('tags').some(containsQuery)) {
                return true;
            }

            if (this.get('members').some(containsQuery)) {
                return true;
            }

            return false;

        }

    }),

    EventsCollection = Backbone.Collection.extend({

        localStorage: new Backbone.LocalStorage('calendar'),
        model: EventModel,
        url: '/calendar',

        comparator: function (eventModel) {
            return eventModel.get('dueDate');
        },

        initialize: function () {
                // keep collection sorted even if dueDate of a model changes
            this.on('change:dueDate', this.sort);
        },

        /**Returns array containing events that happen in the given day.
         * @param year
         * @param month
         * @param day
         * @returns {Array}*/
        getByDate: function(year, month, day) {

			return this.filter(function (eventModel) {

				var dueDate = eventModel.get('dueDate');
				return dueDate.getFullYear() === year
					&& dueDate.getMonth() === month
					&& dueDate.getDate() === day;

			});

		},

        /**Returns array of events that suit query string
         * @param query query string
         * @return {Array}*/
        search: function (query) {

            return this.filter(function (eventModel) {
               return eventModel.suitsQuery(query);
            });

        }

    }),

    /**Predefined collection of calendar events*/
    calendarCollection = new EventsCollection(),

    /**Returns array where each element is trimmed.
     * @param array original array of strings
     * @return {Array}*/
    trimArray = function(array) {
        var trimmedArray = [],
            i, arrayLength = array.length;
        for (i=0; i<arrayLength; i+=1) {
            trimmedArray.push(array[i].trim());
        }
        return trimmedArray;
    },

    /**Returns given form as javascript object.
     * @param form DOM element
     * @return {object}*/
    formToObject = function (form) {

        var fieldsArray = $(form).serializeArray(),
            i, fieldsArrayLength = fieldsArray.length,
            formObject = {};

        for (i=0; i<fieldsArrayLength; i+=1) {
            formObject[fieldsArray[i].name] = fieldsArray[i].value;
        }

        return formObject;

    },

    /**Predefined format of due date*/
    dueDateFormat = 'DD MMMM, HH:mm',

    /**Backbone view of existing calendar event model*/
    CellExistingEventView = Backbone.View.extend({

        tagName: 'div',
        className: 'cell-event',
        cellTemplate: Underscore.template(document.getElementById('cell-existing-event-template').innerHTML),
		popoverTemplate: Underscore.template(document.getElementById('edit-event-template').innerHTML),

		initialize: function() {

            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

		},

        render: function () {

            var model = this.model,
				nameFormatted = model.escape('name'),
				dueDate = model.get('dueDate'),
				dueDateFormatted = moment(dueDate).format(dueDateFormat),
				tagsFormatted = Underscore.escape(model.get('tags').join(', ')),
				membersFormatted = Underscore.escape(model.get('members').join(', ')),
				descriptionFormatted = model.escape('description'),

				cellHtml = this.cellTemplate({
					name: nameFormatted,
					members: membersFormatted
				}),

				popoverHtml = this.popoverTemplate({
					name: nameFormatted,
					dueDate: dueDateFormatted,
					tags: tagsFormatted,
					members: membersFormatted,
					description: descriptionFormatted,
					model: model
				});

            this.$el.html(cellHtml);

            this.$el.popover('destroy');
			this.$el.popover({
				placement: 'right',
				html: true,
				content: popoverHtml,
				container: this.$el,
				trigger: 'manual'
			});

			return this;

        },

        events: {
            'click .cell-event-wrapper': 'togglePopover',
            'submit': 'saveModel',
            'click .remove-event': 'destroyModel'
        },

		togglePopover: function() {
            this.$el.popover('toggle');
		},

		saveModel: function (event) {

            var form = event.target,
                formObject = formToObject(form),
                tempModel;

            formObject.dueDate = moment(formObject.dueDate, dueDateFormat).toDate();
            formObject.dueDate.setFullYear(this.model.get('dueDate').getFullYear());
            formObject.tags = trimArray(formObject.tags.split(','));
            formObject.members = trimArray(formObject.members.split(','));

            tempModel = this.model.set(formObject, {validate: true});
            if (tempModel) {
                this.$el.popover('hide');
            }

			return false;

		},

		destroyModel: function () {
            this.model.destroy();
			return false;
        }

    }),

    /**Backbone view of new event*/
    CellNewEventView = Backbone.View.extend({

        tagName: 'div',
        className: 'cell-new-event',
        cellTemplate: Underscore.template(document.getElementById('cell-new-event-template').innerHTML),
        popoverTemplate: Underscore.template(document.getElementById('edit-event-template').innerHTML),

        initialize: function() {

        },

        render: function () {

            var dueDate = this.options.cellDate,
                dueDateFormatted = moment(dueDate).hours(12).format(dueDateFormat),

                cellHtml = this.cellTemplate(),

                popoverHtml = this.popoverTemplate({
                    name: '',
                    dueDate: dueDateFormatted,
                    tags: '',
                    members: '',
                    description: '',
                    model: null
                });

            this.$el.html(cellHtml);

            this.$el.popover('destroy');
            this.$el.popover({
                placement: 'right',
                html: true,
                content: popoverHtml,
                container: this.$el,
                trigger: 'manual'
            });

            return this;

        },

        events: {
            'click .cell-new-event-wrapper': 'togglePopover',
            'submit': 'saveModel'
        },

        togglePopover: function() {
            this.$el.popover('toggle');
        },

        saveModel: function (event) {

            var form = event.target,
                formObject = formToObject(form),
                tempModel;

            formObject.dueDate = moment(formObject.dueDate, dueDateFormat).toDate();
            formObject.dueDate.setFullYear(this.options.cellDate.getFullYear());
            formObject.tags = trimArray(formObject.tags.split(','));
            formObject.members = trimArray(formObject.members.split(','));

            tempModel = new EventModel(formObject);
            if (tempModel.isValid()) {
                calendarCollection.create(tempModel);
            }

            return false;

        }

    }),

    /**Backbone view of cell - day of calendar*/
    CellView = Backbone.View.extend({

        tagName: 'td',
        className: 'cell',
        template: Underscore.template(document.getElementById('cell-template').innerHTML),

        initialize: function() {
            this.listenTo(this.collection, 'remove', this.render);
        },

        render: function () {

            var el = this.el,
                headText,
                cellExistingEventView,
                cellNewEventView;

            headText = this.options.cellDate.getDate().toString();
            if (this.options.dayName) {
                headText = this.options.dayName + ', ' + headText;
            }

            el.innerHTML = this.template({
                head: headText
            });

            el.classList.remove('cell-with-events');

            if (this.collection.length > 0) {

                el.classList.add('cell-with-events');

                this.collection.forEach(function(eventModel) {

                    cellExistingEventView = new CellExistingEventView({model: eventModel});
                    el.appendChild(cellExistingEventView.render().el);

                });

            }

            cellNewEventView = new CellNewEventView({cellDate: this.options.cellDate});
            el.appendChild(cellNewEventView.render().el);

            return this;

        }

    }),

    /**Returns date of last monday occurred before given date.
     * @param date
     * @return {Date}*/
    // tried to make moment.js to treat monday as the beginning of the week, but got errors :-(
    dateOfLastMonday = function(date) {

		var day = date.getDay();
        // We need to treat Monday as the beginning of the week, not Sunday
		if (day === 0) {
			day = 7;
		}
		day -= 1;
		return new Date(date.getTime() - day*24*60*60*1000);

	},

    SearchView = Backbone.View.extend({

        el: '.search',
        template: Underscore.template(document.getElementById('search-template').innerHTML),
        eventTemplate: Underscore.template(document.getElementById('search-event-template').innerHTML),

        render: function () {

            this.el.innerHTML = this.template();

        },

        events: {
            'keyup .search__input': 'search'
        },

        search: function(event) {

            var query = event.target.value,
                eventModels = this.collection.search(query),
                eventModelsLength = eventModels.length,
                i,
                html = '';

            for (i=0; i < eventModelsLength; i += 1) {
                html += this.eventTemplate({
                    name: eventModels[i].get('name'),
                    dueDate: moment(eventModels[i].get('dueDate')).format('DD MMMM')
                });
            }

            // TODO: make selectable dropdown instead of popover
            this.$el.popover('destroy');
            this.$el.popover({
                placement: 'bottom',
                html: true,
                content: html
            });
            this.$el.popover('show');

            //this.$el.find(".dropdown-toggle").dropdown('toggle');

        }

    }),

    // tried to make moment.js to use russian, but got errors :-(
	namesOfDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],

    CalendarView = Backbone.View.extend({

        el: '.calendar',
        template: Underscore.template(document.getElementById('calendar-template').innerHTML),
        quickAddEventTemplate: Underscore.template(document.getElementById('quick-add-event-template').innerHTML),

		initialize: function() {

            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'sort', this.render);
            this.curMonth = moment().startOf('month').toDate();

		},

        render: function () {

			var dateCounter = dateOfLastMonday(this.curMonth),
                calendarTableElement,
				weekIndex, dayIndex,
				row, cellView, cellCollection, cellEventModels;

            this.el.innerHTML = this.template({
                monthYear: moment(this.curMonth).format('MMMM YYYY')
            });

            this.$quickAddEventButton = this.$el.find('.quick-add-event');
            this.$quickAddEventButton.popover({
                placement: 'bottom',
                html: true,
                content: this.quickAddEventTemplate({
                    curDate: moment().format(dueDateFormat)
                })
            });

            new SearchView({collection: this.collection}).render();

            calendarTableElement = this.el.getElementsByClassName('calendar-table')[0];
			for (weekIndex=0; weekIndex < 5; weekIndex+=1) {

				row = document.createElement('tr');
				row.className = 'calendar-table-row';

				for (dayIndex=0; dayIndex < 7; dayIndex+=1) {

                    // TODO: ineffective
                    cellEventModels = this.collection.getByDate(
                        dateCounter.getFullYear(),
                        dateCounter.getMonth(),
                        dateCounter.getDate());

                    cellCollection = new EventsCollection(cellEventModels);

                    cellView = new CellView({
                        cellDate: new Date(dateCounter.getTime()),
                        dayName: weekIndex === 0 ? namesOfDays[dayIndex] : undefined,
                        collection: cellCollection
                    });

					row.appendChild(cellView.render().el);

					dateCounter.setDate(dateCounter.getDate()+1);

				}

                calendarTableElement.appendChild(row);

			}

            return this;

        },

        events: {
            'submit .quick-add-event-form': 'createEvent',
            'click .refresh-calendar': 'render',
            'click .prev-month': 'prevMonth',
            'click .next-month': 'nextMonth',
            'click .today': 'today'
        },

        /**Pops up alert that the format of quick event creation is wrong*/
        alertWrongQuickEventFormat: function() {
            alert('Упс, непонятно!\n'
                + 'Используйте формат ' + moment().format(dueDateFormat) + ', имя события');
        },

        createEvent: function (event) {

            var formObject = formToObject(event.target),
                dateName = formObject.dateName,
                firstCommaIndex, secondCommaIndex,
                datePart, dueDate, name;

            firstCommaIndex = dateName.indexOf(',');
            if (firstCommaIndex === -1) {
                this.alertWrongQuickEventFormat();
                return false;
            }

            secondCommaIndex = dateName.indexOf(',', firstCommaIndex+1);
            if (secondCommaIndex === -1) {
                this.alertWrongQuickEventFormat();
                return false;
            }

            datePart = dateName.slice(0, secondCommaIndex);
            dueDate = moment(datePart, dueDateFormat).toDate();
            dueDate.setYear(this.curMonth.getFullYear());

            name = dateName.slice(secondCommaIndex+1).trim();

            this.collection.create({name: name, dueDate: dueDate});
            this.$quickAddEventButton.popover('hide');

            return false;

        },

        changeMonth: function(addMonths) {
            this.curMonth.setMonth(this.curMonth.getMonth() + addMonths);
            this.render();
        },

        prevMonth: function() {
            this.changeMonth(-1);
        },

        nextMonth: function() {
            this.changeMonth(1);
        },

        today: function() {
            this.curMonth = moment().startOf('month').toDate();
            this.render();
        }

    });

    calendarCollection.fetch();
	new CalendarView({collection: calendarCollection}).render();

}(jQuery, _, Backbone, moment));

