if (isAssignment(getAssignmentName())) {
	console.log(listPythonNotebooks(getAssignmentName()));
} else {
	downloadAssignment(getAssignmentName(), getassignmentDownloadURL());
}

$("#form_1").validate({
	rules: {
		file: {
			required: true,
			extension: 'zip'
		}
	}
});