function Calendar() {
  this.events = [];

  // can add same event multiple times
  this.add = function(event) {
    this.events.push(event)
  }

  this.remove = function(eventID) {
    this.events.splice(eventID, 1);
  }

  this.getFutureEvents = function() {
    var currentDate = new Date();
    
    return this.events.filter(function(event) { return event.eventDate >= currentDate })
  }

  this.getPastEvents = function() {
    var currentDate = new Date();
    
    return this.events.filter(function(event) { return event.eventDate < currentDate })
  }

  // returns events which have at least one tag from tagList
  this.filterByTags = function(tagsList) {
    function naiveIntersection(firstArray, secondArray) {
      return firstArray.filter(function(x) { return secondArray.indexOf(x) >= 0 })
    }

    return this.events.filter(function(event) { return naiveIntersection(event.tags, tagsList).length !== 0 });
  }
}

function Event(event) {
  this.name         = event.name;  
  this.dateCreated  = new Date();  
  this.eventDate    = event.eventDate; 
  this.description  = (event.description === undefined) ? 
                      'one mysterious event' : 
                      event.description;
  this.participants = (event.participants === undefined) ?
                      [] :
                      event.participants;
  this.tags         = (event.tags === undefined) ?
                      [] :
                      event.tags;

  // this looks like ugly copypaste,
  // but i'm not sure i know how to avoid it
  this.set = function(updates) {
    this.name         = (updates.name === undefined) ? 
                        this.name :
                        updates.name;
    this.eventDate    = (updates.eventDate === undefined) ? 
                        this.eventDate :
                        updates.eventDate;
    this.description  = (updates.description === undefined) ? 
                        this.description : 
                        updates.description;
    this.participants = (updates.participants === undefined) ?
                        this.participants :
                        updates.participants;
    this.tags         = (updates.tags === undefined) ?
                        this.tags :
                        updates.tags;

  }
} 

function Person(person) {
  this.firstName = person.firstName;
  this.lastName  = person.lastName;
}

var person1 = new Person({firstName: 'person1', lastName: 'person111'});
var person2 = new Person({firstName: 'person2', lastName: 'person222'});

var event1 = new Event({name: 'Happy New Year 2012', eventDate: new Date(2012, 1, 1, 0, 0), participants: [person1, person2], tags: ['xxx', 'new year']})
var event2 = new Event({name: 'Happy New Year 2015', eventDate: new Date(2015, 1, 1, 0, 0), participants: [person2, person2], tags: ['yyy', 'new year']})

event2.set({participants: [person1]})

c = new Calendar();

c.add(event1);
c.add(event2);



