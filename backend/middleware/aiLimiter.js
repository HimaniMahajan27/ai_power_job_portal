const User = require('../models/User');

const DAILY_LIMIT = 5;

const checkAiLimit = (feature) => {
  const countField = `aiUsage.${feature}Count`;
  const resetField = `aiUsage.${feature}ResetDate`;

  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const resetDate = user.aiUsage?.[`${feature}ResetDate`];

      // Reset count if last reset was before today
      if (!resetDate || new Date(resetDate) < todayStart) {
        user.set(countField, 0);
        user.set(resetField, todayStart);
      }

      const currentCount = user.get(countField) || 0;

      if (currentCount >= DAILY_LIMIT) {
        const tomorrow = new Date(todayStart);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const hoursLeft = Math.ceil((tomorrow - now) / (1000 * 60 * 60));

        return res.status(429).json({
          success: false,
          message: `Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Resets in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`
        });
      }

      user.set(countField, currentCount + 1);
      await user.save();

      next();
    } catch (error) {
      console.error('AI limiter error:', error);
      next();
    }
  };
};

const getAiUsage = (feature) => {
  return async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const resetDate = user.aiUsage?.[`${feature}ResetDate`];

      let used = user.aiUsage?.[`${feature}Count`] || 0;
      if (!resetDate || new Date(resetDate) < todayStart) {
        used = 0;
      }

      res.json({
        success: true,
        used,
        limit: DAILY_LIMIT,
        remaining: Math.max(0, DAILY_LIMIT - used)
      });
    } catch (error) {
      console.error('AI usage fetch error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch usage' });
    }
  };
};

module.exports = { checkAiLimit, getAiUsage, DAILY_LIMIT };
