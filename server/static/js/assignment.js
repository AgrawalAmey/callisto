$(document).ready(() => {
	assignments.getNotebooksList(getAssignmentName(), 
								 getAssignmentURL())
});

function openNotebook(assignment, notebook, score, attemptsRemaining) {
	assignments.openNotebook(assignment, notebook, score, attemptsRemaining);
}

$("#form_1").validate({
	rules: {
		file: {
			required: true,
			extension: 'zip'
		}
	}
});