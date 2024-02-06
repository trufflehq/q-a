export interface OrgMemberFragment {
  id: string;
  name: string;
  keyValue?: {
    id: string;
    value: string;
  };
  roles: {
    id: string;
    slug: string;
  }[];
  activePowerupConnection: {
    nodes: {
      id: string;
      data: Record<string, unknown>;
      powerup: {
        id: string;
        slug: string;
        name: string;
        data: Record<string, unknown>;
      };
    }[];
  };
  counterConnection: {
    nodes: {
      count: number;
      countable: {
        id: string;
        collectible: {
          id: string;
          entity: {
            emote: {
              id: string;
              name: string;
              sourceType: string;
              urlParams: string;
            };
          };
        };
      };
    }[];
  };
}
