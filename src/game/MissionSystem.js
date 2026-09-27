export const missions = [
  {
    id: "mission-01",
    number: "01",
    title: "EVACUATION CENTER",
    district: "DISTRICT 7",
    category: "BAHA",
    description:
      "May emergency sa distrito. Matuklasan ang evacuation center at alamin kung ano ang tunay na nangyayari.",
    objective: "EVACUATION CENTER"
  },
  {
    id: "mission-02",
    number: "02",
    title: "MGA SINULID",
    district: "DISTRICT 7",
    category: "KURAPSYON",
    description:
      "May report na tinatago ang tulong. Siyasatin ang distrito at piliin kung kanino ka lalapit.",
    objective: "RELIEF WAREHOUSE"
  }
];

export const missionChoices = [
  {
    id: "help",
    title: "TUMULONG",
    description: "Tulungan ang mga taong nasa evacuation center.",
    effects: { humanity: 8, trust: 5 }
  },
  {
    id: "investigate",
    title: "MAGHANAP NG EBIDENSYA",
    description: "Siyasatin ang lugar bago gumawa ng desisyon.",
    effects: { power: 5, trust: 4 }
  },
  {
    id: "leave",
    title: "UMALIS",
    description: "Iwasan ang problema at ipagpatuloy ang paglalakbay.",
    effects: { humanity: -5, trust: -3 }
  }
];

export function getMission(id) {
  return missions.find((mission) => mission.id === id);
}

export function calculateDistance(player, objective) {
  const dx = player.x - objective.x;
  const dz = player.z - objective.z;
  return Math.sqrt(dx * dx + dz * dz);
}
