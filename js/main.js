// compatibility problems because of reduce.
var array2set = function (arr) {
  'use strict';

  return arr.reduce(function (previousValue, currentValue) {
    previousValue[currentValue] = true;
    return previousValue;
  }, {});
};

function Calendar() {
  'use strict';

  this.events = {};
  this.counter = 0;
}

Calendar.prototype.add = function (event) {
  'use strict';

  var eventID = this.counter++;
  this.events[eventID] = event;
  return eventID;
};

Calendar.prototype.remove = function (eventID) {
  'use strict';

  delete this.events[eventID];
};

Calendar.prototype.filterEvents = function (predicate) {
  'use strict';

  var eventID, result = [];

  for (eventID in this.events) {
    if (this.events.hasOwnProperty(eventID) && predicate(this.events[eventID])) {
      result.push(this.events[eventID]);
    }
  }

  return result;
};

Calendar.prototype.getFutureEvents = function () {
  'use strict';

  return this.filterEvents(function (event) { return event.eventDate >= new Date(); });
};

Calendar.prototype.getPastEvents = function () {
  'use strict';

  return this.filterEvents(function (event) { return event.eventDate < new Date(); });
};

// returns events which have at least one tag from tagList
Calendar.prototype.filterByTags = function (tagsList) {
  'use strict';

  function hasAtLeastOneTag(event) {
    var tag_index, event_tags_set = array2set(event.tags);

    for (tag_index = 0; tag_index < tagsList.length; ++tag_index) {
      if (event_tags_set.hasOwnProperty(tagsList[tag_index])) {
        return true;
      }
    }

    return false;
  }

  return this.filterEvents(hasAtLeastOneTag);
};

function Event(event) {
  'use strict';

  this.dateCreated  = new Date(); 
  this.set(Event.prototype.defaults);
  this.set(event);
}

// analogous to dict.update in python.
// maybe there is something built in
Event.prototype.set = function (updates) {
  'use strict';

  var property;

  for (property in updates) {
    if (updates.hasOwnProperty(property)) {
      this[property] = updates[property];
    }
  }
};

Event.prototype.defaults = {description: 'no description available', 
                               participants: [], 
                               tags: []};

function Person(person) {
  'use strict';

  this.firstName = person.firstName;
  this.lastName  = person.lastName;
}

var person1 = new Person({firstName: 'person1', lastName: 'person111'});
var person2 = new Person({firstName: 'person2', lastName: 'person222'});

var event1 = new Event({name: 'Happy New Year 2012', eventDate: new Date(2012, 0, 1, 0, 0), participants: [person1, person2], tags: ['xxx', 'new year']});
var event2 = new Event({name: 'Happy New Year 2015', eventDate: new Date(2015, 0, 1, 0, 0), participants: [person1, person2], tags: ['yyy', 'new year']});

event2.set({participants: [person1]});

var c = new Calendar();

c.add(event1);
c.add(event2);



