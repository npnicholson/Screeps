const ACTION_IDLE = 0;
const ACTION_HARVESTING = 1;
const ACTION_BUILDING = 2;
const ACTION_UPGRADING = 3;
const ACTION_DELIVERING = 4;

export const upgrader = {
    identify: function(creep: Creep) {
        return creep.memory.role === 'upgrader';
    },

    kill: function (creep: Creep) {
        creep.suicide();
    },

    /** @param {Creep} creep **/
    run: function(creep: Creep) {



        if((creep.memory.action === ACTION_UPGRADING || creep.memory.action === ACTION_IDLE) && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.action = ACTION_HARVESTING;
            creep.say('🔄 harvest');
        }
        else if((creep.memory.action === ACTION_HARVESTING || creep.memory.action === ACTION_IDLE) && creep.store.getFreeCapacity() == 0) {
            creep.memory.action = ACTION_UPGRADING;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.action === ACTION_UPGRADING) {
            const controller = creep.room.controller;
            if(controller && creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};
