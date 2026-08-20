export type Level = {
  id: number;
  title: string;
  subtitle: string;
  url: string;
  duration?: string;
};

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "A Better Way to Feel",
    subtitle: "The opening breath.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300554/LEVEL_-_1_A_Better_Way_to_Feel_mjjgis.mp4",
    duration: "01:30",
  },
  {
    id: 2,
    title: "Is Everything Okay?",
    subtitle: "A quiet inquiry inward.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780430012/LEVEL_-_2_Is_Everything_Okay_xahmxh.mp4",
    duration: "02:00",
  },
  {
    id: 3,
    title: "The World Has Changed",
    subtitle: "Witnessing the shift.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300566/LEVEL_-_3_The_world_has_changed_qun1nj.mp4",
    duration: "02:38",
  },
  {
    id: 4,
    title: "The Hidden Damage",
    subtitle: "What lives beneath the surface.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300551/LEVEL_-_4_The_Hidden_Damage_yszd35.mp4",
    duration: "02:13",
  },
  {
    id: 5,
    title: "The Healing System",
    subtitle: "The medicine within.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300572/LEVEL_-_5_The_Healing_System_u7cnw8.mp4",
    duration: "03:03",
  },
  {
    id: 6,
    title: "The Reconnection",
    subtitle: "Reuniting with your core.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780262992/LEVEL_6_-_THE_RECONNECTION_1_mrxd4e.mp4",
    duration: "02:54",
  },
  {
    id: 7,
    title: "The Conscious Living",
    subtitle: "Practice and integration.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780424932/Level_7_-_The_Conscious_Living_ht2hqm.mp4",
    duration: "02:18",
  },
];

export const TRACKED_LEVELS = LEVELS.length;
export const STORAGE_KEY = "hrj_completed_levels_v1";

export function formatDuration(seconds: number) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}
