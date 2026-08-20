const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/users/search
// @desc    Search users by name or email
// @access  Private
router.get('/users/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    // Search users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    }).select('_id name email avatar location').limit(10);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation history with a specific user
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Get all messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get list of conversations (recent contacts)
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $limit: 50 }
    ]);

    // Populate user details
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('_id name email avatar location');
        return {
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({ success: true, conversations: populatedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      body('receiver').notEmpty().withMessage('Receiver is required'),
      body('subject').trim().notEmpty().withMessage('Subject is required'),
      body('content').trim().notEmpty().withMessage('Content is required')
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { receiver, subject, content, application, job, inReplyTo } = req.body;

    try {
      // Generate thread ID
      let threadId = req.body.threadId;
      if (!threadId && inReplyTo) {
        const parentMessage = await Message.findById(inReplyTo);
        threadId = parentMessage ? parentMessage.threadId : null;
      }
      if (!threadId) {
        threadId = `${req.user._id}_${receiver}_${Date.now()}`;
      }

      const message = await Message.create({
        sender: req.user._id,
        receiver,
        subject,
        content,
        application,
        job,
        threadId,
        inReplyTo
      });

      await message.populate([
        { path: 'sender', select: 'name avatar' },
        { path: 'receiver', select: 'name avatar' }
      ]);

      res.status(201).json({
        success: true,
        message
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @route   GET /api/messages
// @desc    Get all messages (inbox)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('-createdAt');

    // Group by thread
    const threads = {};
    messages.forEach(msg => {
      if (!threads[msg.threadId]) {
        threads[msg.threadId] = [];
      }
      threads[msg.threadId].push(msg);
    });

    res.json({
      success: true,
      count: messages.length,
      messages,
      threads: Object.values(threads)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/unread
// @desc    Get unread message count
// @access  Private
router.get('/unread', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/thread/:threadId
// @desc    Get messages in a thread
// @access  Private
router.get('/thread/:threadId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      threadId: req.params.threadId,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        threadId: req.params.threadId,
        receiver: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or receiver can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
