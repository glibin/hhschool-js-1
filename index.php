<!DOCTYPE HTML>
<html lang="en">

    <!--TODO
    make reset commit cancelable event edit/creation
    -->
    <head>
        <title>zooble</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="css/main.css">
    </head>
    <body>
        <div id="toolbar">
            <div class="toolbar-part">
                <div class="toolbar-clickable" onclick="reset()">RESET</div>
            </div>
            <div class="toolbar-part">
                <button data-bind="click: addEvent, enable: !selectedEvent()">Add event</button>
            </div>
            <div class="toolbar-part">
                <label>
                    <input type="radio" value="all" data-bind="checked: eventsByDateFilter">All
                </label>
                <label>
                    <input type="radio" value="past" data-bind="checked: eventsByDateFilter">Past
                </label>
                <label>
                    <input type="radio" value="upcoming" data-bind="checked: eventsByDateFilter">Upcoming
                </label>
            </div>
            <div class="toolbar-part">
                <div data-bind="foreach: allTags">
                    <label>
                        <input type="checkbox" data-bind="value: $data, checked: $parent.filteringTags">
                        <span data-bind="text: $data"></span>
                    </label>
                </div>
            </div>
        </div>

        <div id="events" data-bind="template: { name: eventTemplate, foreach: filteredEvents, as: 'event' }"></div>

        <div style="clear: both;"></div>

        <!--templates-->
        <script type="text/html" id="eventDisplayTemplate">
            <div class="event">
                <div class="event-control">
                    <button data-bind="click: $root.editEvent, enable: !$root.selectedEvent()">Edit</button>
                    <button data-bind="click: $root.removeEvent, enable: !$root.selectedEvent()">Delete</button>
                </div>
                <div class="event-name" data-bind="text: name"></div>
                <div class="event-date" data-bind="text: prettyEventDate"></div>
                <div class="event-description" data-bind="text: description"></div>
                <ul class="event-participants" data-bind="foreach: participants">
                    <li class="event-participant" data-bind="text: fullName"></li>
                </ul>
                <div class="event-tags" data-bind="foreach: tags">
                    <div class="event-tag" data-bind="text: $data"></div>
                </div>
            </div>
        </script>
        <script type="text/html" id="eventEditTemplate">
            <div class="event">
                <div data-bind="template: {name: 'eventForm', data: $data}"></div>
                <button data-bind="click: $root.saveFunc">Save changes</button>
                <button data-bind="click: $root.cancelFunc">Cancel</button>
            </div>
        </script>
        <script type="text/html" id="eventForm">
            <label>Event name:
                <input type="text" data-bind="value: name, hasfocus: true"/>
            </label>
            <label>Event description:
                <input type="text" data-bind="value: description"/>
            </label>
        </script>
        <!--templates-->

        <script type="text/javascript" src="js/lib/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="js/lib/knockout-2.2.1.debug.js"></script>
        <script type="text/javascript" src="js/lib/knockout.validation.js"></script>
        <script type="text/javascript" src="js/lib/knockout.mapping.js"></script>

        <script type="text/javascript" src="js/knockout.extensions.js"></script>
        <script type="text/javascript">
            var Zooble = {};
        </script>
        <script type="text/javascript" src="js/util.js"></script>
        <script type="text/javascript" src="js/entity-json-builder.js"></script>
        <script type="text/javascript" src="js/data-provider.js"></script>
        <script type="text/javascript" src="js/entities/Event.js"></script>
        <script type="text/javascript" src="js/entities/Participant.js"></script>
        <script type="text/javascript" src="js/main-view-model.js"></script>
        <script type="text/javascript" src="js/app.js"></script>

        <script type="text/javascript">
            function reset() {
                localStorage.removeItem('Zooble.events');
                localStorage.removeItem('Zooble.events.autoincrement');
                window.location.reload();
            }
        </script>
    </body>
</html>