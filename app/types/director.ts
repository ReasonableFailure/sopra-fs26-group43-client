export interface Director {
  id: number;
  userId: number;
  scenarioId: number;
  directorToken: string;
}

export interface DirectorPutDTO {
  id: number;
}
export interface DirectorGetDTO {
  directorId: number;
  directorToken: string;
}
