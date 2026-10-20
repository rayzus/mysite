// A Minecraft account's skin (or cape with ?type=cape), straight from Mojang, looked up by UUID.
export default async function handler(req, res) {
  const uuid = String(req.query.uuid || '').replace(/-/g, '');
  const kind = req.query.type === 'cape' ? 'CAPE' : 'SKIN';
  if (!/^[0-9a-f]{32}$/i.test(uuid)) return res.status(400).end();
  try {
    const r = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
    if (r.status !== 200) return res.status(404).end();
    const prop = ((await r.json()).properties || []).find(p => p.name === 'textures');
    const tex = prop && JSON.parse(Buffer.from(prop.value, 'base64').toString()).textures[kind];
    if (!tex) return res.status(404).end();
    const img = await fetch(tex.url.replace(/^http:/, 'https:'));
    if (!img.ok) return res.status(502).end();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(Buffer.from(await img.arrayBuffer()));
  } catch (e) {
    res.status(502).end();
  }
}
