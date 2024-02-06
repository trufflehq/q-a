export default {
  path: '@olympus-3548/qa',
  name: 'qa',
  embeds: [
    {
      slug: 'app-management',
      url: 'https://PROJECT_ID.web.app/app-management',
      contentPageType: 'appManagement',
      defaultStyles: {
        width: '100vw',
        height: '100vh',
      },
    },
    {
      slug: 'youtube-embed',
      url: 'https://PROJECT_ID.web.app/embed?platform=youtube',
      contentPageType: 'youtubeChatFrame',
      defaultStyles: {
        display: 'none',
      },
      parentQuerySelector: '#contents',
    },
    {
      slug: 'twitch-embed',
      url: 'https://PROJECT_IDweb.app/embed?platform=twitch',
      contentPageType: 'twitch',
      minTruffleVersion: '4.4.11',
      defaultStyles: {
        display: 'none',
      },
      parentQuerySelector: '.channel-root__right-column',
    },
    {
      slug: 'youtube-ask-button',
      url: 'https://PROJECT_ID.web.app/embed/ask-button?platform=youtube',
      contentPageType: 'youtubeChatFrame',
      minTruffleVersion: '4.4.11',
      defaultStyles: {
        display: 'none',
      },
      parentQuerySelector: '#buttons > #picker-buttons',
    },
    {
      slug: 'twitch-ask-button',
      url: 'https://PROJECT_ID.web.app/embed/ask-button?platform=twitch',
      contentPageType: 'twitch',
      minTruffleVersion: '4.4.11',
      defaultStyles: {
        display: 'none',
      },
      parentQuerySelector: '.chat-input__textarea > div:last-child > div',
    }
  ]
};