// Report controller — full implementation is in Commit 2.
const getSummary = (req, res) => res.json({ success: true, data: {} });
const getByCategory = (req, res) => res.json({ success: true, data: [] });
const getTrends = (req, res) => res.json({ success: true, data: [] });
const getComparison = (req, res) => res.json({ success: true, data: [] });

module.exports = { getSummary, getByCategory, getTrends, getComparison };
