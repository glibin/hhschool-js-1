// compatibility problems because of reduce
var array2set = function(arr) {
  return arr.reduce(function(previousValue, currentValue) {
                      previousValue[currentValue] = true;
                      return previousValue;
                    }, 
                    {});
}

function Calendar() {
  this.events = {};
  this.counter = 0;

  this.add = function(event) {
    eventID = this.counter++;
    this.events[eventID] = event;
    return eventID;
  }

  this.remove = function(eventID) {
    delete this.events[eventID];
  }

  this.filterEvents = function(predicate) {
    var result = [];
    
    for (var eventID in this.events) {
      if (this.events.hasOwnProperty(eventID) && predicate(this.events[eventID])) {
        result.push(this.events[eventID]);
      }
    }

    return result;    
  }

  this.getFutureEvents = function() {
    return this.filterEvents(function(event) { return event.eventDate >= new Date() });
  }

  this.getPastEvents = function() {
    return this.filterEvents(function(event) { return event.eventDate < new Date() });
  }

  // returns events which have at least one tag from tagList
  this.filterByTags = function(tagsList) {
    function hasAtLeastOneTag(event) {
      event_tags_set = array2set(event.tags);

      for (var tag_index = 0; tag_index < tagsList.length; ++tag_index) {
        if (event_tags_set.hasOwnProperty(tagsList[tag_index])) {
          return true;
        }
      }

      return false;
    }

    return this.filterEvents(hasAtLeastOneTag);
  }
}

// analogous to dict.update in python.
// maybe there is something built in
Event.prototype.set = function(updates) {
  for (var property in updates) {
    if (updates.hasOwnProperty(property)) {
      this[property] = updates[property];
    }
  }
}

Event.prototype.defaults = {description: 'no description available', 
                            participants: [], 
                            tags: []}

function Event(event) {
  this.dateCreated  = new Date(); 
  this.set(Event.prototype.defaults); 
  this.set(event);
} 

function Person(person) {
  this.firstName = person.firstName;
  this.lastName  = person.lastName;
}

var person1 = new Person({firstName: 'person1', lastName: 'person111'});
var person2 = new Person({firstName: 'person2', lastName: 'person222'});

var event1 = new Event({name: 'Happy New Year 2012', eventDate: new Date(2012, 1, 1, 0, 0), participants: [person1, person2], tags: ['xxx', 'new year']});
var event2 = new Event({name: 'Happy New Year 2015', eventDate: new Date(2015, 1, 1, 0, 0), participants: [person1, person2], tags: ['yyy', 'new year']});

event2.set({participants: [person1]});

c = new Calendar();

c.add(event1);
c.add(event2);



