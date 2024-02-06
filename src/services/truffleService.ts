import { Embed, getAccessToken, getEmbed } from "@trufflehq/sdk";

export const getTruffleAccessToken = async (): Promise<string> => {
  const accessToken = await getAccessToken();
  return accessToken;
};

export const getTruffleEmbed = (): Embed => {
  const embed = getEmbed();
  return embed;
};

