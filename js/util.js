Zooble.util = (function () {
    return {
        any : function (obj, func) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (func(obj[prop])) {
                        return true;
                    }
                }
            }
            return false;
        },
        all : function (obj, func) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (!func(obj[prop])) {
                        return false;
                    }
                }
            }
            return true;
        }
    }
})();