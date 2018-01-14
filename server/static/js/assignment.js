$("#form_1").validate({
	rules: {
		file: {
			required: true,
			extension: 'zip'
		}
	}
});