import * as role from "headers/role";

// Configurations to be used when building creeps that fill roles
export const PARTS_CONFIG: { [key in role.Roles]: { [key: number]: Array<BodyPartConstant> } } = {
  [role.UNASSIGNED]: {},
  [role.HARVESTER]: {
    300: [WORK, WORK, CARRY, MOVE],
    350: [WORK, WORK, CARRY, MOVE, MOVE],
    400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    500: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    600: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    650: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    700: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    750: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    800: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
  },
  [role.BUILDER]: {
    300: [WORK, WORK, CARRY, MOVE],
    350: [WORK, WORK, CARRY, MOVE, MOVE],
    400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    500: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    600: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    650: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    700: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    750: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    800: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
  },
  [role.UPGRADER]: {
    300: [WORK, WORK, CARRY, MOVE],
    350: [WORK, WORK, CARRY, MOVE, MOVE],
    400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    500: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    550: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    600: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    650: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    700: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    750: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    800: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
  },
  [role.REPAIRER]: {
    300: [WORK, WORK, CARRY, MOVE],
    350: [WORK, WORK, CARRY, MOVE, MOVE],
    400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    500: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    550: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
  }
};

for (let role in PARTS_CONFIG) {
  for (let level in PARTS_CONFIG[parseInt(role) as role.Roles]) {
    const level_int = parseInt(level);
    const cost = bodyCost(PARTS_CONFIG[parseInt(role) as role.Roles][level_int]);
    if (cost !== level_int) console.log('[PARTS_CONFIG Err] Role:' + role + ' Level/Cost:' + level + ' != ' + cost);
  }
}

export function bodyCost(body: Array<BodyPartConstant>)
{
    let sum = 0;
    for (let i in body) sum += BODYPART_COST[body[i]];
    return sum;
}
