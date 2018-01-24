$("#zipUploadForm").validate({
	rules: {
		solutionsZip: {
			required: true,
			extension: 'zip'
		}
	}
})