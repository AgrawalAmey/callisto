$('#editAssignmentModal').on('show.bs.modal', function(e) {

    //get data-id attribute of the clicked element
    var i = $(e.relatedTarget).data('id');

    var assignments = getAssignments();

    //populate the textboxes

    $(e.currentTarget).find('h4[name="oldNameHeader"]').html("Edit " + assignments[i].name);
    $(e.currentTarget).find('input[name="oldName"]').val(assignments[i].name);
    $(e.currentTarget).find('input[name="name"]').val(assignments[i].name);
	$(e.currentTarget).find('input[name="startTime"]').val(assignments[i].startTime);
	$(e.currentTarget).find('input[name="endTime"]').val(assignments[i].endTime); 
    $(e.currentTarget).find('input[name="isEvaluative"]').prop('checked', assignments[i].isEvaluative); 
});

$('#removeAssignmentModal').on('show.bs.modal', function(e) {

    //get data-id attribute of the clicked element
    var i = $(e.relatedTarget).data('id');

    var assignments = getAssignments();

    //populate the textboxes

    $(e.currentTarget).find('h4[name="nameHeader"]').html("Are you sure you want to remove " + assignments[i].name);
    $(e.currentTarget).find('input[name="name"]').val(assignments[i].name);  
});

function AddUploadProblemChange() {
	if($('#cb1').is(":checked"))   
        $("#AddProblemFile").show();
    else
        $("#AddProblemFile").hide();
}

AddUploadProblemChange();

function AddUploadSolutionChange() {
	if($('#cb2').is(":checked"))   
        $("#AddSolutionFile").show();
    else
        $("#AddSolutionFile").hide();
}

AddUploadSolutionChange();

function EditUploadProblemChange() {
	if($('#cb4').is(":checked"))   
        $("#EditProblemFile").show();
    else
        $("#EditProblemFile").hide();
}

EditUploadProblemChange();

function EditUploadSolutionChange() {
	if($('#cb5').is(":checked"))   
        $("#EditSolutionFile").show();
    else
        $("#EditSolutionFile").hide();
}

EditUploadSolutionChange();

$('.datetimepicker').datetimepicker();

$("#addAssignmentForm").validate({
    rules: {
        name: {
            required: true
        },
        startTime: {
            required: true,
            date: true
        },
        endTime: {
            required: true,
            date: true
        }
    },
    submitHandler: function(form) {
        if($('#cb1').is(":checked")) {
            var addFile = $('#addProblems').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        if($('#cb2').is(":checked")) {
            var addFile = $('#addSolutions').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        form.submit();
    }
});

$("#editAssignmentForm").validate({
    rules: {
        oldName: {
            required: true
        },
        name: {
            required: true
        },
        startTime: {
            required: true,
            date: true
        },
        endTime: {
            required: true,
            date: true
        }
    },
    submitHandler: function(form) {
        if($('#cb4').is(":checked")) {
            var addFile = $('#editProblems').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        if($('#cb5').is(":checked")) {
            var addFile = $('#editSolutions').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        form.submit();
    }
});
$("#removeAssignmentForm").validate({
    rules: {
        name: {
            required: true
        }
    },
    submitHandler: function(form) {
        form.submit();
    }
});

function AddUploadPracticeProblemChange() {
    if($('#cb6').is(":checked"))   
        $("#AddPracticeProblemFile").show();
    else
        $("#AddPracticeProblemFile").hide();
}

AddUploadPracticeProblemChange();

function AddUploadPracticeSolutionChange() {
    if($('#cb7').is(":checked"))   
        $("#AddPracticeSolutionFile").show();
    else
        $("#AddPracticeSolutionFile").hide();
}

AddUploadPracticeSolutionChange();

$("#addPracticeAssignmentForm").validate({
    rules: {
        name: {
            required: true
        },
        startTime: {
            required: true,
            date: true
        },
        endTime: {
            required: true,
            date: true
        }
    },
    submitHandler: function(form) {
        if($('#cb1').is(":checked")) {
            var addFile = $('#addProblems').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        if($('#cb2').is(":checked")) {
            var addFile = $('#addSolutions').val();
            if(addFile === '' || addFile == undefined) {
                return; // to do: return error message
            }
        }

        form.submit();
    }
});