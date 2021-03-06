const ACTION_IDLE = 0;
const ACTION_HARVESTING = 1;
const ACTION_BUILDING = 2;
const ACTION_UPGRADING = 3;
const ACTION_DELIVERING = 4;

import * as role from "headers/role";

export const builder = {
    identify: function (creep: Creep) {
        return creep.memory.role === role.BUILDER;
    },

    kill: function (creep: Creep): boolean {
        creep.suicide();
        return true;
    },

    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        if ((creep.memory.action === ACTION_BUILDING || creep.memory.action === ACTION_IDLE) && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.action = ACTION_HARVESTING;
            creep.say('🔄 collect');
        }
        if ((creep.memory.action === ACTION_HARVESTING || creep.memory.action === ACTION_IDLE) && creep.store.getFreeCapacity() == 0) {
            creep.memory.action = ACTION_BUILDING
            creep.say('🚧 build');
        }

        if (creep.memory.action === ACTION_BUILDING) {
            // If there is a tower to build, build that first
            var towers = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: {structureType: STRUCTURE_TOWER}});
            if (towers.length) {
                if (creep.build(towers[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(towers[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                // No towers, check for roads
                var road = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: {structureType: STRUCTURE_ROAD}});
                if (road) {
                    if (creep.build(road) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(road, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // No roads, check for other sites
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (targets.length) {
                        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    } else {
                        const target = creep.room.find(FIND_FLAGS);
                        creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
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

            // Next collect from containers or storage
            const structures = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType === STRUCTURE_STORAGE) &&
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
            let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // if (sources.length > 1) source = sources[1];

            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }

        }
    }
};
