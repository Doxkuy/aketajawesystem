export interface BiodiversityItem {
  id: string;
  name: string;
  latinName: string;
  description: string;
  ecosystem: string;
  status: string;
  rarity: string;
  glowColor: string;
}

export interface MapBlock {
  id: string;
  name: string;
  area: string;
  ecosystem: string;
  features: string[];
  coordinates: string;
  threatLevel: 'Low' | 'Moderate' | 'High';
  description: string;
}
