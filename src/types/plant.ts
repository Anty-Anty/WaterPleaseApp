export type Plant = {
  id: string;
  _id?: string;
  title: string;
  img: string;
  wLevel: number;
  lastWateredDate: string;
  daysToNextWatering: number;
  mapPosition?: number | null;
  mapId?: string;
};
