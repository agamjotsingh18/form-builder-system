
let submissions = []; 

function getAllSubmissions() {
  return submissions;
}

function saveSubmission(submission) {
  submissions.push(submission);
}

module.exports = {
  getAllSubmissions,
  saveSubmission
};