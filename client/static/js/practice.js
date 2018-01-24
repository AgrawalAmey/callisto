$(function() {
	practice.NBList(function(list) {
		populateDivs(list);
	});

	$("#addNotebookForm").validate({
	    rules: {
	        name: {
	            required: true
	        }
	    },
	    submitHandler: function(form) {
	    	var notebookName = $('#newNBName').val();
	    	notebookName = notebookName + '.ipynb';
	        practice.copyNewNB(notebookName);

	        // form.submit();
	    }
	});
});

var tempLi = [];

populateDivs = function(list) {
	var tempList = [];

	for (var i = 0; i < list.length; i++) {
		if(list[i].split('.').pop() === 'ipynb') {
			tempList.push(list[i]);
		}
	}

	list = tempList;
	tempLi = list;

	if (list === undefined || list.length === 0) {
		var tr = document.createElement('tr');
		tr.append('No Practice Notebooks Created');
		$('.table-responsive').append(tr);
	} else {
		var table = document.createElement('table');
		table['id'] = 'practiceNBTable';
		$('.table-responsive').append(table);
		document.getElementById('practiceNBTable').className = 'table table-striped';
		document.getElementById('practiceNBTable').cellpadding = '1';
		document.getElementById('practiceNBTable').cellspacing = '1';
		var thead = document.createElement('thead');
		thead['id'] = 'practiceNBTableHead';
		$('#practiceNBTable').append(thead);
		var tr = document.createElement('tr');
		tr['id'] = 'tableHeaderRow';
		$('#practiceNBTableHead').append(tr);
		$('#tableHeaderRow').append('<th>Name</th>');
		$('#tableHeaderRow').append('<th></th>');

		var tbody = document.createElement('tbody');
		tbody['id'] = 'practiceNBTableBody';
		$('#practiceNBTable').append(tbody);

		for (var j = 0; j < list.length; j++) {
			tr = document.createElement('tr');
			var temp = 'tr_' + j;
			tr['id'] = temp;
			$('#practiceNBTableBody').append(tr);
			var td = document.createElement('td');
			var prevTemp = '#' + temp;
			temp = 'td_' + j;
			td['id'] = temp;
			var later = prevTemp;
			$(prevTemp).append(td);
			var a = document.createElement('a');
			prevTemp = '#' + temp;
			temp = 'a_' + j;
			a['id'] = temp
			a['href'] = '#';
			$(prevTemp).append(a);
			document.getElementById(temp).className = 'btn-sm btn-primary m-t-n-xs';
			document.getElementById(temp).onclick = function(e) {
				practice.openNB(list[Number(e.currentTarget.id.split('_')[1])]);
			};
			prevTemp = '#' + temp;
			$(prevTemp).append(list[j].split('.ipynb')[0]);

			var td2 = document.createElement('td');
			temp = 'td2_del_' + j;
			td2['id'] = temp;
			$(later).append(td2);
			var a2 = document.createElement('a');
			prevTemp = '#' + temp;
			temp = 'a2_del_' + j;
			a2['id'] = temp;
			$(prevTemp).append(a2);
			var i2 = document.createElement('i');
			prevTemp = '#' + temp;
			temp = 'i_del_' + j;
			i2['id'] = temp;
			$(prevTemp).append(i2);
			document.getElementById(temp).className = 'pe-7s-trash pe-lg';
			temp = 'a2_del_' + j;
			document.getElementById(temp).onclick = function(e) {
				practice.deleteNB(list[Number(e.currentTarget.id.split('_')[2])], function() {
					location.reload();
				});
			};
		}
	}
}