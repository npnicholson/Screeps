const ACTION_IDLE = 0;
const ACTION_HARVESTING = 1;
const ACTION_BUILDING = 2;
const ACTION_UPGRADING = 3;
const ACTION_DELIVERING = 4;
const ACTION_REPAIRING = 5;

import * as role from "headers/role";

export const repairer = {
    identify: function (creep: Creep) {
        return creep.memory.role === role.REPAIRER;
    },

    kill: function (creep: Creep): boolean {
        creep.suicide();
        return true;
    },

    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        if ((creep.memory.action === ACTION_REPAIRING || creep.memory.action === ACTION_IDLE) && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.action = ACTION_HARVESTING;
            creep.say('🔄 collect');
        }
        else if ((creep.memory.action === ACTION_HARVESTING || creep.memory.action === ACTION_IDLE) && creep.store.getFreeCapacity() == 0) {
            creep.memory.action = ACTION_REPAIRING;
            creep.say('🛠 repair');
        }

        if (creep.memory.action === ACTION_REPAIRING) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax;
                }
            });

            targets

            if (targets.length) {
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                const target = creep.room.find(FIND_FLAGS);
                creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
        else {
            // First collect from tombs
            const tombs = creep.room.find(FIND_TOMBSTONES, {
                filter: (tomb) => {
                    return tomb.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                }
            })
            if (tombs.length > 0) {
                if (creep.withdraw(tombs[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tombs[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // Next collect from ruins
            const ruins = creep.room.find(FIND_RUINS, {
                filter: (tomb) => {
                    return tomb.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                }
            })
            if (ruins.length > 0) {
                if (creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ruins[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // Next collect from containers
            const structures = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 100;
                }
            });
            if (structures.length > 0) {
                if (creep.withdraw(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // Finally if none of those exist with energy, go harvest at a source
            // const sources = creep.room.find(FIND_SOURCES);
            // let source = sources[0];
            // if (sources.length > 1) source = sources[1];
            let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};
