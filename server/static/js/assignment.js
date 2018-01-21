$(document).ready(() => {
	assignments.getNotebooksList(getAssignmentName(), 
								 getAssignmentURL())
});

function openNotebook(assignement, notebook, score, attemptsRemaining) {
	assignments.openNotebook(assignement, notebook, score, attemptsRemaining);
}

$("#form_1").validate({
	rules: {
		file: {
			required: true,
			extension: 'zip'
		}
	}
});