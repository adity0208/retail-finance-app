import { Clothing } from '../models/Clothing.js';
import { generateUniqueLookupCode } from '../utils/codeGenerator.js';

// POST /api/clothing
export const createClothing = async (req, res) => {
  try {
    const { photoData, gender, size, costPriceInPaise, retailPriceInPaise, articleCode, stockCount } = req.body;

    if (costPriceInPaise == null || retailPriceInPaise == null || !gender || !size) {
      return res.status(400).json({ success: false, error: 'Missing required clothing fields' });
    }

    // Validate paise integers
    if (!Number.isInteger(costPriceInPaise) || !Number.isInteger(retailPriceInPaise)) {
      return res.status(400).json({ success: false, error: 'Price fields must be integers representing paise' });
    }

    // Ensure articleCode exists; generate a short lookup code if not supplied
    let finalArticleCode = articleCode ? String(articleCode).trim() : await generateUniqueLookupCode(8);
    const quickLookupCode = finalArticleCode;

    const item = await Clothing.create({
      photoData: photoData || null,
      gender,
      size,
      costPriceInPaise,
      retailPriceInPaise,
      articleCode: finalArticleCode,
      quickLookupCode,
      stockCount: Number.isInteger(stockCount) ? stockCount : 0
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Article code or quick lookup code must be unique' });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/clothing
// Uses req.query for filtering and sorting (e.g., ?gender=Men&size=M&minPrice=1000&maxPrice=2000)
export const listClothing = async (req, res) => {
  try {
    const { gender, size, articleCode, minPriceInPaise, maxPriceInPaise } = req.query;
    const filter = {};

    if (gender) filter.gender = gender;
    if (size) filter.size = size;
    if (articleCode) filter.articleCode = String(articleCode).trim();

    if (minPriceInPaise || maxPriceInPaise) {
      filter.retailPriceInPaise = {};
      if (minPriceInPaise) filter.retailPriceInPaise.$gte = parseInt(minPriceInPaise, 10);
      if (maxPriceInPaise) filter.retailPriceInPaise.$lte = parseInt(maxPriceInPaise, 10);
    }

    const items = await Clothing.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch clothing items' });
  }
};

// GET /api/clothing/:id
export const getClothingById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Clothing.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Clothing item not found' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch clothing item' });
  }
};
