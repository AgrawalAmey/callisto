$(document).ready(() => {
	assignments.getNotebooksList(getAssignmentName(), 
								 getAssignmentURL())
});

function openNotebook(assignement, notebook) {
	assignments.openNotebook(assignement, notebook);
}

$("#form_1").validate({
	rules: {
		file: {
			required: true,
			extension: 'zip'
		}
	}
});