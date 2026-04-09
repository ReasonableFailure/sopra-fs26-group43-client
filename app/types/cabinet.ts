export interface Cabinet {
  id: number;
  cabinetName: string;
  cabinetDescription: string | null;
  scenarioId: number | null;
}

/** POST /cabinets */
export interface CabinetPostDTO {
  cabinetName: string;
  cabinetDescription: string | null;
  scenarioId: number;
}

/** PUT /cabinets/{id} */
export interface CabinetPutDTO {
  cabinetName?: string;
  cabinetDescription?: string;
}
