export class GetGameMatchDto {
  match: {
    id: number;
    game: string;
    tournament: string;
    startsAt: string;
    teamA: {
      id: string;
      name: string;
    };
    teamB: {
      id: string;
      name: string;
    };
  };

  config: {
    lockAt: string;
    basePoints: number;
    multiplier: number;
    maxMultiplier: number;
    allowDraw: boolean;
  };
}
