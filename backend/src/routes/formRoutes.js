
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const formSchema = require('../data/formSchema');
const { getAllSubmissions, saveSubmission } = require('../data/storage');
const { validateSubmission } = require('../utils/validator');

const router = express.Router();

// GET /api/form-schema
router.get('/form-schema', (req, res) => {
  res.status(200).json(formSchema); 
});

// POST /api/submissions
router.post('/submissions', (req, res) => {
  const submissionData = req.body;
  const { error, value } = validateSubmission(submissionData);

  if (error) {
    const errors = {};
    error.details.forEach(detail => {
      errors[detail.context.key] = detail.message;
    });

    return res.status(400).json({ success: false, errors });
  }

  const newSubmission = {
    id: uuidv4(), 
    createdAt: new Date().toISOString(), 
    data: value, 
  };

  saveSubmission(newSubmission);

  res.status(201).json({
    success: true,
    id: newSubmission.id,
    createdAt: newSubmission.createdAt,
  });
});

// GET /api/submissions (Paginated and Sortable)
router.get('/submissions', (req, res) => {
  let { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query; 

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || ![10, 20, 50].includes(limit)) limit = 10; 

  const submissions = getAllSubmissions();
  const totalCount = submissions.length;
  const totalPages = Math.ceil(totalCount / limit); 

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy !== 'createdAt') return 0;

    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (sortOrder === 'asc') {
      return dateA.getTime() - dateB.getTime();
    } else { 
      return dateB.getTime() - dateA.getTime();
    }
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex).map(sub => ({
    id: sub.id,
    createdAt: sub.createdAt,
    data: sub.data 
  }));

  res.status(200).json({
    submissions: paginatedSubmissions,
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    sortBy,
    sortOrder
  });
});

module.exports = router;