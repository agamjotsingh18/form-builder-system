let submissions = []; 

function getAllSubmissions() {
  return submissions;
}

function getSubmissionById(id) {
    return submissions.find(sub => sub.id === id);
}

function saveSubmission(submission) {
  submissions.push(submission);
}

function updateSubmission(id, updatedData) {
    const index = submissions.findIndex(sub => sub.id === id);
    if (index !== -1) {
        submissions[index].data = updatedData;
        submissions[index].updatedAt = new Date().toISOString(); 
        return submissions[index];
    }
    return null;
}

function deleteSubmission(id) {
    const initialLength = submissions.length;
    submissions = submissions.filter(sub => sub.id !== id);
    return submissions.length !== initialLength; 
}

module.exports = {
  getAllSubmissions,
  getSubmissionById, 
  saveSubmission,
  updateSubmission, 
  deleteSubmission  
};