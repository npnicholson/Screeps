import { harvester } from "roles/harvester";
import { builder } from "roles/builder";
import { upgrader } from "roles/upgrader";
import { repairer } from "roles/repairer";

import * as role from "headers/role";
import { PARTS_CONFIG } from "headers/const";
import { type } from "os";

export function processRooms() {
  // Clear the memory
  for (const roomManager of roomManagers) {
    roomManager.room.memory.creeps = [];
    roomManager.room.memory.spawns = [];
  }

  // Assign Creeps
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    _roomMap[creep.room.name].memory.creeps.push(creep);
  }

  // Assign Spawns
  for (const spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName];
    _roomMap[spawn.room.name].memory.spawns.push(spawn);
  }

  // Process rooms
  for (const roomManager of roomManagers) roomManager.process();
}

interface Manifest { creeps: { [key in role.Roles]: number } };
interface Assignments { creeps: { [key in role.Roles]: number } };

const _roomMap: { [key: string]: Room } = {};
const roomManagers: RoomManager[] = [];

export class RoomManager {
  readonly room: Room;
  private manifest: Manifest;
  private assignments: Assignments;

  constructor(room: Room) {
    this.room = room;
    this.manifest = {
      creeps: {
        [role.UNASSIGNED]: 0,
        [role.HARVESTER]: 0,
        [role.BUILDER]: 0,
        [role.UPGRADER]: 0,
        [role.REPAIRER]: 0,
      }
    };
    this.assignments = {
      creeps: {
        [role.UNASSIGNED]: 0,
        [role.HARVESTER]: 1,
        [role.BUILDER]: 1,
        [role.UPGRADER]: 1,
        [role.REPAIRER]: 1,
      }
    }

    // Assign the static room map
    _roomMap[room.name] = room;
    roomManagers.push(this);
  }

  // Process all functionality of this room
  // Note: Process can be called many times after the initial creation of this object!
  process() {

    // Reset the current manifest
    this.manifest = {
      creeps: {
        [role.UNASSIGNED]: 0,
        [role.HARVESTER]: 0,
        [role.BUILDER]: 0,
        [role.UPGRADER]: 0,
        [role.REPAIRER]: 0,
      }
    };
    // Loop through all creeps in this room
    for (const creep of this.room.memory.creeps) {
      // Count to see how much of each type of creep we have
      if (harvester.identify(creep)) this.manifest.creeps[role.HARVESTER]++;
      else if (builder.identify(creep)) this.manifest.creeps[role.BUILDER]++;
      else if (upgrader.identify(creep)) this.manifest.creeps[role.UPGRADER]++;
      else if (repairer.identify(creep)) this.manifest.creeps[role.REPAIRER]++;
    }

    // Get the number of active construction sites
    const sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    // Calculate how many of each creep type this room needs
    if (sites.length > 0) {
      // Construction underway
      this.assignments.creeps[role.HARVESTER] = 2;
      this.assignments.creeps[role.BUILDER] = 3;
      this.assignments.creeps[role.UPGRADER] = 1;
      this.assignments.creeps[role.REPAIRER] = 1;
    } else {
      // No construction underway
      this.assignments.creeps[role.HARVESTER] = 2;
      this.assignments.creeps[role.BUILDER] = 0;
      this.assignments.creeps[role.UPGRADER] = 4;
      this.assignments.creeps[role.REPAIRER] = 1;
    }

    for (const creep of this.room.memory.creeps) {
      if (harvester.identify(creep)) {
        harvester.run(creep);
        if (this.manifest.creeps[role.HARVESTER] > this.assignments.creeps[role.HARVESTER]) {
          if(harvester.kill(creep)) this.manifest.creeps[role.HARVESTER]--;
        }
      } else if (builder.identify(creep)) {
        builder.run(creep)
        if (this.manifest.creeps[role.BUILDER] > this.assignments.creeps[role.BUILDER]) {
          if( builder.kill(creep)) this.manifest.creeps[role.BUILDER]--;
        }
      } else if (upgrader.identify(creep)) {
        upgrader.run(creep)
        if (this.manifest.creeps[role.UPGRADER] > this.assignments.creeps[role.UPGRADER]) {
          if (upgrader.kill(creep)) this.manifest.creeps[role.UPGRADER]--;
        }
      } else if (repairer.identify(creep)) {
        repairer.run(creep)
        if (this.manifest.creeps[role.REPAIRER] > this.assignments.creeps[role.REPAIRER]) {
          if (repairer.kill(creep)) this.manifest.creeps[role.REPAIRER]--;
        }
      } else console.log('Unknown Creep Type ' + creep.memory.role + ' - ' + creep.name);
    }

    new RoomVisual(this.room.name).text(`H:${this.assignments.creeps[role.HARVESTER]}, B:${this.assignments.creeps[role.BUILDER]}, R:${this.assignments.creeps[role.REPAIRER]}, U:${this.assignments.creeps[role.UPGRADER]}`, 10, 5, { color: 'green', font: 0.8 });
    new RoomVisual(this.room.name).text(`H:${this.assignments.creeps[role.HARVESTER] - this.manifest.creeps[role.HARVESTER]}, B:${this.assignments.creeps[role.BUILDER] - this.manifest.creeps[role.BUILDER]}, R:${this.assignments.creeps[role.REPAIRER] - this.manifest.creeps[role.REPAIRER]}, U:${this.assignments.creeps[role.UPGRADER] - this.manifest.creeps[role.UPGRADER]}`, 10, 6, { color: 'green', font: 0.8 });

    // This is the total energy storage (spawn and extenders) available to be filled in this room.
    // If there is at least one harvester, then we can make something up to the energy that the room
    // can hold. Otherwise, we can only make something that is 300 energy
    const spawn_cap = this.manifest.creeps[role.HARVESTER] === 0 ? 300 : this.room.energyCapacityAvailable;

    // Create new creeps as needed
    if (this.manifest.creeps[role.HARVESTER] < this.assignments.creeps[role.HARVESTER]) {
      const creep_name = 'harvester-' + Date.now();
      const structure = buildStructure(spawn_cap, role.HARVESTER);
      const res = this.room.memory.spawns[0].spawnCreep(structure, creep_name, { memory: { action: 0, role: role.HARVESTER, target: {} } });
      if (res === 0) console.log('Building Harvester (C: ' + bodyCost(structure) + ') -- ' + creep_name);
    }

    if (this.manifest.creeps[role.BUILDER] < this.assignments.creeps[role.BUILDER]) {
      const creep_name = 'builder-' + Date.now();
      const structure = buildStructure(spawn_cap, role.BUILDER);
      const res = this.room.memory.spawns[0].spawnCreep(structure, creep_name, { memory: { action: 0, role: role.BUILDER, target: {} } });
      if (res === 0) console.log('Building Builder (C: ' + bodyCost(structure) + ') -- ' + creep_name);
    }

    if (this.manifest.creeps[role.UPGRADER] < this.assignments.creeps[role.UPGRADER]) {
      const creep_name = 'upgrader-' + Date.now();
      const structure = buildStructure(spawn_cap, role.UPGRADER);
      const res = this.room.memory.spawns[0].spawnCreep(structure, creep_name, { memory: { action: 0, role: role.UPGRADER, target: {} } });
      if (res === 0) console.log('Building Updater (C: ' + bodyCost(structure) + ') -- ' + creep_name);
    }

    if (this.manifest.creeps[role.REPAIRER] < this.assignments.creeps[role.REPAIRER]) {
      const creep_name = 'repairer-' + Date.now();
      const structure = buildStructure(spawn_cap, role.REPAIRER);
      const res = this.room.memory.spawns[0].spawnCreep(structure, creep_name, { memory: { action: 0, role: role.REPAIRER, target: {} } });
      if (res === 0) console.log('Building Repairer (C: ' + bodyCost(structure) + ') -- ' + creep_name);
    }

  }
};

function buildStructure(energy_capacity: number, role: role.Roles): Array<BodyPartConstant>
{
  // If the energy capacity exactly matches one of the configurations we already have, then
  // just reference it directly. EG: energy_capacity = 300, PARTS_CONFIG[role][300] exists
  if (PARTS_CONFIG[role][energy_capacity]) return PARTS_CONFIG[role][energy_capacity];
  else {                                                                    // 425
    const energy_levels = Object.keys(PARTS_CONFIG[role]); // ['300' '350' '400' '450' '500'...]

    let max = -1;
    for (let i = energy_levels.length; i > 0; i--) {
      const level = parseInt(energy_levels[i]);

      // The first time we find a level that is less than the total capacity, we use that
      if (level < energy_capacity) return PARTS_CONFIG[role][level];
    }

    // If no level was found, then we don't have a defined structure for this role. This should
    // never happen
    return [ ];
  }

}

function bodyCost(body: Array<BodyPartConstant>)
{
    let sum = 0;
    for (let i in body) sum += BODYPART_COST[body[i]];
    return sum;
}
