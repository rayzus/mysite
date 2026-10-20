// The badges Discord shows on a profile (quests, Nitro, boosts, "originally known as" and the rest).
// Lanyard can't see these, so this asks dstn's profile API, which returns Discord's own badge list.
export default async function handler(req, res) {
  const id = String(req.query.id || '');
  if (!/^\d{15,21}$/.test(id)) return res.status(400).json([]);
  try {
    const r = await fetch(`https://dcdn.dstn.to/profile/${id}`);
    const j = r.ok ? await r.json() : null;
    const badges = (j && Array.isArray(j.badges) ? j.badges : [])
      .filter(b => b && b.icon)
      .map(b => ({ id: b.id, description: b.description || '', icon: b.icon }));
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json(badges);
  } catch (e) {
    res.status(502).json([]);
  }
}
