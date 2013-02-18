Zooble.entityJsonBuilder = (function () {
    var registeredBuilders = {};
    return {
        build : function (entityClass, json) {
            return registeredBuilders[entityClass](json);
        },
        registerBuilder : function (entityClass, builderFunction) {
            registeredBuilders[entityClass] = builderFunction;
        }
    }
})();