import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

export const appMetaTags = (title?: string) => {
  const description = 'Team Abfindung — Vertragsunterzeichnung';

  return [
    {
      title: title ? `${title} - Team Abfindung` : 'Team Abfindung',
    },
    {
      name: 'description',
      content: description,
    },
    {
      name: 'author',
      content: 'Team Abfindung GmbH',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
    {
      property: 'og:title',
      content: 'Team Abfindung — Vertragsunterzeichnung',
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ];
};
