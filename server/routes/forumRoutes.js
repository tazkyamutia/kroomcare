const express = require('express');
const router = express.Router();
const {
  getForums,
  createForum,
  getForumDetail,
  getForumReplies,
  addReply,
  deleteForum,
  deleteReply
} = require('../controllers/forumController');

// Route untuk mendapatkan daftar forum
router.get('/', getForums);

// Route untuk membuat thread forum baru
router.post('/', createForum);

// Route untuk mendapatkan detail thread forum berdasarkan ID
router.get('/:id', getForumDetail);

// Route untuk mendapatkan seluruh balasan forum berdasarkan ID forum
router.get('/:id/replies', getForumReplies);

// Route untuk menambahkan balasan forum baru
router.post('/replies', addReply);

// Route untuk moderasi (menghapus thread dan balasan forum)
router.delete('/:id', deleteForum);
router.delete('/replies/:id', deleteReply);

module.exports = router;
