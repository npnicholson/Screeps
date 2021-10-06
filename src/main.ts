import { ErrorMapper } from "utils/ErrorMapper";

import { harvester } from "roles/harvester";
import { builder } from "roles/builder";
import { upgrader } from "roles/upgrader";
import { repairer } from "roles/repairer";
import internal from "stream";

const ACTION_IDLE = 0;
const ACTION_HARVESTING = 1;
const ACTION_BUILDING = 2;
const ACTION_UPGRADING = 3;
const ACTION_DELIVERING = 4;

declare global {

  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room?: string;
    action: number;
    target: {
      source?: Id<Source>,
      structure?: Id<Structure>
    }
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  const sites = Game.spawns['Spawn1'].room.find(FIND_MY_CONSTRUCTION_SITES);


  let target_harvesters = 0;
  let target_builders = 0;
  let target_upgraders = 2;
  let target_repairers = 1;

  if (sites.length > 0) {
    target_harvesters = 0;
    target_builders = 3;
  } else {
    target_harvesters = 3;
    target_builders = 0;
  }

  // console.log(target_harvesters, target_builders, target_repairers, target_upgraders);

  // console.log(`Spawns: ${Game.spawns}`);

  // console.log(Game.spawns.Alpha.spawnCreep([WORK, CARRY, MOVE], 'Worker1', { dryRun: false }));

  // Count to see how much of each type of creep we have
  let num_harvesters = 0, num_builders = 0, num_upgraders = 0, num_repairers = 0;
  for(var name in Game.creeps) {
    const creep = Game.creeps[name];
    if(harvester.identify(creep)) {
      num_harvesters ++;
      harvester.run(creep);
      if (num_harvesters > target_harvesters) harvester.kill(creep);

    } else if(builder.identify(creep)) {
      num_builders ++;
      builder.run(creep)
      if (num_builders > target_builders) builder.kill(creep);
    } else if(upgrader.identify(creep)) {
      num_upgraders ++;
      upgrader.run(creep)
      if (num_upgraders > target_upgraders) upgrader.kill(creep);
    } else if(repairer.identify(creep)) {
      num_repairers ++;
      repairer.run(creep)
      if (num_repairers > target_repairers) repairer.kill(creep);
    }
  }

  if (num_harvesters < target_harvesters) {
    const creep_name = 'harvester-' + Date.now();
    const res = Game.spawns.Spawn1.spawnCreep([WORK, WORK, CARRY, MOVE], creep_name, { memory: { role: 'harvester', action: ACTION_IDLE, target: {} } });
    if (res === 0)  console.log('Building Harvester: ' + creep_name);
  }

  if (num_builders < target_builders) {
    const creep_name = 'builder-' + Date.now();
    const res = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE, MOVE], creep_name, { memory: { role: 'builder', action: ACTION_IDLE, target: {} } });
    if (res === 0)  console.log('Building Builder: ' + creep_name);
  }

  if (num_upgraders < target_upgraders) {
    const creep_name = 'upgrader-' + Date.now();
    const res = Game.spawns.Spawn1.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], creep_name, { memory: { role: 'upgrader', action: ACTION_IDLE, target: {} } });
    if (res === 0) console.log('Building Upgrader: ' + creep_name);
  }

  if (num_repairers < target_repairers) {
    const creep_name = 'repairer-' + Date.now();
    const res = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE, MOVE], creep_name, { memory: { role: 'repairer', action: ACTION_IDLE, target: {} } });
    if (res === 0) console.log('Building Repairer: ' + creep_name);
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
