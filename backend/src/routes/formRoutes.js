
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const formSchema = require('../data/formSchema');
const { 
    getAllSubmissions, 
    saveSubmission, 
    getSubmissionById, 
    updateSubmission, 
    deleteSubmission 
} = require('../data/storage');
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

// PUT /api/submissions/:id
router.put('/submissions/:id', (req, res) => {
    const submissionId = req.params.id;
    const submissionData = req.body;

    const { error, value } = validateSubmission(submissionData);

    if (error) {
        const errors = {};
        error.details.forEach(detail => {
            errors[detail.context.key] = detail.message;
        });
        return res.status(400).json({ success: false, errors });
    }
    
    const updatedSub = updateSubmission(submissionId, value);

    if (!updatedSub) {
        return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.status(200).json({
        success: true,
        id: updatedSub.id,
        updatedAt: updatedSub.updatedAt,
    });
});

// DELETE /api/submissions/:id 
router.delete('/submissions/:id', (req, res) => {
    const submissionId = req.params.id;
    const deleted = deleteSubmission(submissionId);

    if (deleted) {
        return res.status(204).send(); // HTTP 204 No Content on successful deletion
    } else {
        return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
});


// GET /api/submissions (Paginated, Sortable, and Searchable) 
router.get('/submissions', (req, res) => {
    let { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || ![10, 20, 50].includes(limit)) limit = 10;

    let submissions = getAllSubmissions();
    let filteredSubmissions = [...submissions];

    if (search) {
        const searchTerm = search.toLowerCase();
        filteredSubmissions = submissions.filter(sub => 
            Object.values(sub.data).some(value => 
                (typeof value === 'string' || typeof value === 'number') && String(value).toLowerCase().includes(searchTerm)
            ) ||
            sub.id.toLowerCase().includes(searchTerm) ||
            sub.createdAt.toLowerCase().includes(searchTerm)
        );
    }

    const totalCount = filteredSubmissions.length;
    const totalPages = Math.ceil(totalCount / limit);

    const sortedSubmissions = filteredSubmissions.sort((a, b) => {
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
        data: sub.data,
        updatedAt: sub.updatedAt 
    }));

    res.status(200).json({
        submissions: paginatedSubmissions,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        sortBy,
        sortOrder,
        search
    });
});

module.exports = router;