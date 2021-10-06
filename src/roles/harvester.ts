const ACTION_IDLE = 0;
const ACTION_HARVESTING = 1;
const ACTION_BUILDING = 2;
const ACTION_UPGRADING = 3;
const ACTION_DELIVERING = 4;

export const harvester = {

    identify: function (creep: Creep) {
        return creep.memory.role === 'harvester';
    },

    kill: function (creep: Creep) {
        // If this creep is idle OR its harvesting but empty, kill it
        if (creep.memory.action === ACTION_IDLE ||
            (creep.memory.action === ACTION_HARVESTING && creep.store[RESOURCE_ENERGY] == 0)) creep.suicide();
    },

    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        // If we are empty, and not harvesting, go harvest
        // else if we are full and not delivering, try to deliver
        // if can't deliver, then idle

        if (creep.memory.action === ACTION_IDLE) {
            if (creep.store.getUsedCapacity() > 0) {
                creep.memory.target.structure = chooseStructure(creep);
                if (creep.memory.target.structure) {
                    creep.memory.action = ACTION_DELIVERING;
                    creep.say('📦 deliver');
                }
            } else {
                creep.memory.target.source = chooseSource(creep);
                if (creep.memory.target.source) {
                    creep.memory.action = ACTION_HARVESTING;
                    creep.say('🔄 harvest');
                }
            }
        }

        // If we are not currently harvesting, and are empty, then go harvest
        else if (creep.memory.action !== ACTION_HARVESTING && creep.store.getUsedCapacity() === 0) {
            creep.memory.target.source = chooseSource(creep);
            if (creep.memory.target.source) {
                creep.memory.action = ACTION_HARVESTING;
                creep.say('🔄 harvest');
            } else creep.memory.action = ACTION_IDLE;
        }

        // If we are full but not delivering, then deliver
        else if (creep.memory.action !== ACTION_DELIVERING && creep.store.getFreeCapacity() === 0) {
            creep.memory.target.structure = chooseStructure(creep);
            if (creep.memory.target.structure) {
                creep.memory.action = ACTION_DELIVERING;
                creep.say('📦 deliver');
            } else creep.memory.action = ACTION_IDLE;
        }

        // console.log('Harvester Action ' + creep.memory.action);

        if (creep.memory.action === ACTION_HARVESTING) {

            if (creep.memory.target.source) {
                const target = Game.getObjectById(creep.memory.target.source);
                if (target) {
                    if (creep.harvest(target) == ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                    return;
                }
            }
        } else if (creep.memory.action === ACTION_DELIVERING) {
            if (creep.memory.target.structure) {
                const target = Game.getObjectById(creep.memory.target.structure);
                if (target) {
                    const v = creep.transfer(target, RESOURCE_ENERGY);
                    if (v == ERR_NOT_IN_RANGE) creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    else if (v == ERR_FULL) creep.memory.action = ACTION_IDLE;
                    return;
                }
            }
        } else if (creep.memory.action === ACTION_IDLE) {
            const target = creep.room.find(FIND_FLAGS);
            creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
    }
};

function chooseSource(creep: Creep) {
    // const sources = creep.room.find(FIND_SOURCES);
    // if (sources.length > 0) return sources[Math.floor(Math.random() * sources.length)].id;
    // else return undefined;
    let source = creep.pos.findClosestByRange(FIND_SOURCES);
    return (source) ? source.id : undefined;

}

function chooseStructure(creep: Creep) {
    const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    if (structures.length > 0) return structures[Math.floor(Math.random() * structures.length)].id;
    else return undefined;
}
