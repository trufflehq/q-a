import { OrgMemberFragment } from "./types";

export const getOrgMember = async (
  accessToken: string,
  orgId: string,
  userId: string
) => {
  if (!accessToken) {
    console.log("No access token");
    return;
  }

  const ORG_MEMBER_QUERY = `query($input: OrgMemberInput) {
    orgMember(input:$input) {
      id
      name
      keyValue(input: { key: "nameColor" }) {
          id
          value
        }
    }
    }`;

  const mtResponse = await fetch("https://mothertree.truffle.vip/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    },
    body: JSON.stringify({
      query: ORG_MEMBER_QUERY,
      variables: {
        input: {
          orgIdAndUserId: {
            orgId: orgId,
            userId: userId,
          },
        },
      },
    }),
  });
  const mtJson = await mtResponse.json();
  return mtJson.data.orgMember;
};

const COLORS = [
  "#ff0000",
  "#009000",
  "#b22222",
  "#ff7f50",
  "#9acd32",
  "#ff4500",
  "#2e8b57",
  "#daa520",
  "#d2691e",
  "#5f9ea0",
  "#1e90ff",
  "#ff69b4",
  "#00ff7f",
  "#a244f9",
];

export function getColor({
  orgMember,
}: {
  orgMember: OrgMemberFragment;
}): string {
  const id = orgMember?.id || "";
  const keyValueColor = orgMember?.keyValue?.value;
  if (keyValueColor) return keyValueColor;
  const hash = getStringHash(id);
  return COLORS[((hash % COLORS.length) + COLORS.length) % COLORS.length];
}

export function getColorRgb({
  orgMember,
}: {
  orgMember: OrgMemberFragment;
}): string {
  const color = getColor({ orgMember });
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  return `${r},${g},${b}`;
}

function getStringHash(string: string): number {
  let hash = 0;
  if (string.length === 0) return 0;
  for (let i = 0; i < string.length; i++) {
    const chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function getName({ orgMember }: { orgMember: OrgMemberFragment }) {
  let name = orgMember?.name || "Anonymous";
  // for some reason this throws sometimes with a URI malformed error
  try {
    name = decodeURIComponent(name);
  } catch {}
  return name;
}
