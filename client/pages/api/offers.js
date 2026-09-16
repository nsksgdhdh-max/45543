export default async function handler(req, res) {
  // Proxy request to m1.top offers_export_api
  const WEBMASTER_ID = '993341';
  const API_KEY = '9c23a4de7c85633bf978986b9e8c1729';

  const url = `http://m1.top/offers_export_api/?webmaster_id=${WEBMASTER_ID}&api_key=${API_KEY}`;

  try {
    const r = await fetch(url, { method: 'GET' });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If response is not JSON, forward as-is
      return res.status(502).json({ error: 'Invalid response from upstream', body: text });
    }

    // Data may be array or object with offers
    const offers = Array.isArray(data) ? data : data.offers || data;

    // Helper: determine category from text
    function detectCategory(o) {
      const s = ((o.name || '') + ' ' + (o.info || '') + ' ' + (o.description || '')).toLowerCase();
      if (/капсул|капсула|capsul|capsule|capsules|kapsel|kapseln/i.test(s)) return 'kapsula';
      if (/крем|cream|creme|cremes|crema/i.test(s)) return 'krem';
      if (/спрей|spray|spritzer/i.test(s)) return 'sprey';
      if (/капли|drops|tropf/i.test(s)) return 'kapli';
      if (/гель|gel|gels/i.test(s)) return 'gel';
      return 'other';
    }

    // Filter: geo Germany (DE) and nutra offers and without landing
    const filtered = (offers || []).filter((o) => {
      try {
        const geoOk = (() => {
          if (o.target && Array.isArray(o.target)) {
            return o.target.some((t) => {
              if (!t) return false;
              if (typeof t === 'string') return t.toLowerCase() === 'de' || t.toLowerCase() === 'germany';
              if (t.code) return String(t.code).toLowerCase() === 'de' || String(t.code).toLowerCase() === '276';
              if (t.country) return String(t.country).toLowerCase().includes('germ');
              return false;
            });
          }
          if (o.target && typeof o.target === 'object') {
            const code = o.target.code || o.target.country || '';
            return String(code).toLowerCase().includes('de') || String(code).toLowerCase().includes('germ');
          }
          if (o.geo_name) return String(o.geo_name).toLowerCase().includes('germ');
          return false;
        })();

        const isNutra = (() => {
          const s = ((o.name || '') + ' ' + (o.info || '') + ' ' + (o.description || '')).toLowerCase();
          // detect common nutra product types and keywords (RU/EN)
          return /капсул|капсула|капсулы|капси|капс|крем|гель|гели|гель|капли|спрей|таблет|пилл|drops|cream|gel|spray|capsul|capsule|capsules|tablet|pill|vitamin|supplement/i.test(s);
        })();

        const hasLanding = (() => {
          if (!o.landing) return false;
          if (Array.isArray(o.landing)) return o.landing.length > 0;
          if (typeof o.landing === 'object') return Object.keys(o.landing).length > 0;
          return !!o.landing;
        })();

        return geoOk && isNutra && !hasLanding;
      } catch (err) {
        return false;
      }
    });

    // Enrich offers by fetching their detailed info (product-level API)
    const WEB_URL_BASE = `http://m1.top/offers_export_api/?webmaster_id=${WEBMASTER_ID}&api_key=${API_KEY}`;

    async function fetchDetail(product_id) {
      try {
        const rr = await fetch(WEB_URL_BASE + `&product_id=${encodeURIComponent(product_id)}`);
        const txt = await rr.text();
        try {
          const dd = JSON.parse(txt);
          if (Array.isArray(dd)) return dd[0] || null;
          if (dd && dd.offers && Array.isArray(dd.offers)) return dd.offers[0] || null;
          return dd || null;
        } catch (e) {
          return null;
        }
      } catch (e) {
        return null;
      }
    }

    // limit concurrency to small batches to avoid overloading upstream
    const enriched = [];
    const BATCH = 8;
    for (let i = 0; i < filtered.length; i += BATCH) {
      const chunk = filtered.slice(i, i + BATCH);
      const details = await Promise.all(chunk.map((o) => (o.product_id ? fetchDetail(o.product_id) : Promise.resolve(null))));
      for (let j = 0; j < chunk.length; j++) {
        const base = chunk[j];
        const det = details[j] || {};
        const merged = Object.assign({}, base, det || {});
        // normalize image
        merged.img = merged.img || merged.image || merged.picture || merged.photo || (merged.images && merged.images[0]) || '';
        // detect price for DE target if present
        if (!merged.price && merged.target && Array.isArray(merged.target)) {
          const de = merged.target.find((t) => (t.code || '').toString().toUpperCase() === 'DE' || (t.geo_name || '').toLowerCase().includes('germ'));
          if (de) merged.price = de.price || de.cost || null;
        }
        merged.category = detectCategory(merged);
        enriched.push(merged);
      }
    }

    res.status(200).json({ count: enriched.length, offers: enriched });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
