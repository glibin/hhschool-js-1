ko.utils.clone = function (source) {
    var result = {};
    for (var sourceProp in source) {
        if (!source.hasOwnProperty(sourceProp)) {
            continue;
        }
        var sourcePropValue = source[sourceProp];
        var propValue;
        if (ko.isWriteableObservable(sourcePropValue)) {
            if (sourcePropValue.constructor.name === "Array") {
                propValue = ko.observableArray(sourcePropValue());
            } else {
                propValue = ko.observable(sourcePropValue());
            }
        } else {
            propValue = sourcePropValue;
        }
        result[sourceProp] = propValue;
    }
    return result;
};