// Last played song from Last.fm, without exposing whose account it is.
// Set LASTFM_USER and LASTFM_KEY in Vercel → Project → Settings → Environment Variables.
const BLANK = '2a96cbd8b46e442fc41c2b86b821562f'; // Last.fm's grey "no art" star

export default async function handler(req, res) {
  const { LASTFM_USER, LASTFM_KEY } = process.env;
  if (!LASTFM_USER || !LASTFM_KEY) return res.status(204).end();
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&limit=1&format=json`
      + `&user=${encodeURIComponent(LASTFM_USER)}&api_key=${encodeURIComponent(LASTFM_KEY)}`;
    const t = (await (await fetch(url)).json()).recenttracks?.track?.[0];
    if (!t) return res.status(204).end();
    const art = (t.image || []).map(x => x['#text']).filter(u => u && !u.includes(BLANK)).pop() || '';
    // only the song itself goes out: no username, no profile or track links
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    res.status(200).json({
      live: t['@attr']?.nowplaying === 'true',
      name: t.name,
      artist: t.artist?.['#text'] || '',
      album: t.album?.['#text'] || '',
      art,
    });
  } catch (e) {
    res.status(502).json({});
  }
}
