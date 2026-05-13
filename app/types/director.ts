export interface Director {
  id: number;
  userId: number;
  scenarioId: number;
  directorToken: string;
}

export interface DirectorPostDTO {
  id: number;
}
export interface DirectorGetDTO {
  id: number;
  token: string;
}
