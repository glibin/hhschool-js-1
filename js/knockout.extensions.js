ko.utils.clone = function (source) {
    var result = {};
    if (typeof(source) != "object") {
        return source;
    }
    for (var sourceProp in source) {
        if (!source.hasOwnProperty(sourceProp)) {
            continue;
        }
        var sourcePropValue = source[sourceProp];
        var propValue;
        if (ko.isWriteableObservable(sourcePropValue)) {
            var observableValue = sourcePropValue();
            if (observableValue == null) {
                propValue = null;
            } else if (observableValue.constructor.name === "Array") {
                var newArray = [];
                for (var i = 0; i < observableValue.length; i++) {
                    newArray.push(ko.utils.clone(observableValue[i]));
                }
                propValue = ko.observableArray(newArray);
            } else {
                propValue = ko.observable(observableValue);
            }
        } else {
            propValue = sourcePropValue;
        }
        result[sourceProp] = propValue;
    }
    return result;
};