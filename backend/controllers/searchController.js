import { Clothing } from '../models/Clothing.js';
import { Electronics } from '../models/Electronics.js';

// GET /api/search?code=XYZ
export const searchByCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ success: false, error: 'Query param "code" is required' });

    const q = String(code).trim();

    // Search clothing by articleCode or quickLookupCode
    const clothing = await Clothing.find({ $or: [{ articleCode: q }, { quickLookupCode: q }] }).limit(10);

    // Search electronics by serialNumber or quickLookupCode
    const electronics = await Electronics.find({ $or: [{ serialNumber: q }, { quickLookupCode: q }] }).limit(10);

    return res.status(200).json({ success: true, count: clothing.length + electronics.length, data: { clothing, electronics } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Search failed' });
  }
};
