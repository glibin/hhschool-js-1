// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function Participant() {
	
	// Participant's name
	this.name = '';

	// Participant's surname
	this.surname = '';

	// Participant's lastname
	this.lastname = '';

	// Participant's email
	this.email = '';

	// Email validation
	function checkEmail(email) {
		if (email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) { 
			return true;
		} else {
			return false;
		}
	};

	/* setters */

	this.setName = function(name) {
		this.name = name;
		return this;
	};

	this.setSurname = function(surname) {
		this.surname = surname;
		return this;
	};

	this.setLastname = function(lastname) {
		this.lastname = lastname;
		return this;
	};

	this.setEmail = function(email) {
		this.email = checkEmail(email) ? email : '';
		return this;
	};

	this.setAll = function(name, surname, lastname, email) {
		this.name = name || '';
		this.surname = surname || '';
		this.lastname = lastname || '';
		this.email = checkEmail(email) ? email : '';
		return this;
	};

	
}

eventCounter = 0

function Event () {
	
	// Event ID
	this.id = eventCounter;
	eventCounter += 1;

	// Event title
	this.title = '';
	
	// Event list of tags
	this.tags = [];

	// Event list of participants
	this.participants = [];

	// Event creation date
	this.systemDate = new Date();

	// Event date
	this.eventDate = new Date();

	// Event description
	this.description = '';

	/* setters */

	this.setTitle = function(title) {
		this.title = title;
		return this;
	};

	this.setEventDate = function(eventDate) {
		this.eventDate = eventDate;
		return this;
	};

	this.setDescription = function(description) {
		this.description = description;
		return this;
	};

	/* handling tags */

	this.tagIndex = function(tag) {
		return this.tags.indexOf(tag);
	}

	this.tagExists = function(tag) {
		if (this.tagIndex(tag) >= 0) {
			return true;
		} else {
			return false;
		}		
	}

	this.addTag = function(tag) {
		if (!this.tagExists(tag)) {
			this.tags.push(tag);
		} else {
			// Tag already exists
		}
		return this;
	};
	
	this.removeTag = function(tag) {
		if ((index = this.tagIndex(tag)) >= 0) {
			delete this.tags.remove(index);
		} else {
			// Tag doesn't exist
		}
		return this;
	};

	/* handling participants */

	this.addParticipant = function(participant) {
		this.participants.push(participant);
		return this;
	};

	/* edit event */
	this.updateEvent = function(params) {
		for (key in params) {
			if (key == 'title') {
				this.title = params[key] || '';
			} else if (key == 'eventDate') {
				this.eventDate = params[key] || '';
			} else if (key == 'tags') {
				this.tags = []
				for (var i = 0; i < params[key].length; i++) {
					this.tags.push(params[key][i]);	
				}
			}
		}
		return this;
	}
}

function EventManager () {

	// List of events
	this.eventList = [];

	/* handling events */

	this.addEvent = function(event) {
		this.eventList[event.id] = event;
		return this;
	};

	this.eventExistsByID = function(id) {
		if (this.eventList[id] != undefined) {
			return true;
		} else {
			return false;
		}
	}

	this.removeEventByID = function(id) {
		if (this.eventExistsByID(id)) {
			this.eventList.remove(id);
		}
		return this;
	};

	this.getEventByID = function(id) {
		return this.eventList[id];
	};

	// filter by tag
	this.getEventsByTag = function(tag) {
		var result = [];
		for (item in this.eventList) if (this.eventList.hasOwnProperty(item)) {
			if (this.eventList[item].tagExists(tag)) {
				result.push(this.eventList[item]);
			}
		} 
		return result; 
	};

	// Less or equal comparator
	lte = function(a, b) {
		return a <= b;
	}

	// Greater comparator
	gt = function(a, b) {
		return a > b;
	}

	// Events filter by date
	this.getEvents = function(comparator) {
		var result = [];
		for (item in this.eventList) if (this.eventList.hasOwnProperty(item)) {
			if (comparator(this.eventList[item].eventDate, new Date())) {
				result.push(this.eventList[item]);
			}
		} 
		return result; 
	};

	/* getters */

	this.getPastEvents = function () {
		return this.getEvents(lte);
	};
	
	this.getFutureEvents = function (tag) {
		return this.getEvents(gt);
	};
}

eventManager = new EventManager();

/* Some events for testing purposes */

participant1 = (new Participant()).setAll('Name1','Surname1',null,'test@example.com')
participant2 = (new Participant()).setAll('Name2','Surname2','Lastname2','test@example')

testEvent1 = (new Event()).setTitle('test event 1').setEventDate(new Date("2013-02-18")).addTag('1').addParticipant(participant1);
testEvent2 = (new Event()).setTitle('test event 2').setEventDate(new Date("2013-02-19")).addTag('2').addParticipant(participant2);

eventManager.addEvent(testEvent1);
eventManager.addEvent(testEvent2);

/*
testEvent1.updateEvent({title:'test update'})
testEvent2.updateEvent({title:'test update again', lol:0, tags:['tag1','tag2','tag3']})
eventManager.getPastEvents()
eventManager.getFutureEvents()
eventManager.getEventsByTag('1')
eventManager.getEventsByTag('2')
eventManager.getEventsByTag('3')
*/