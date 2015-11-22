function BronKerboschMaxByInclusion(m) {
	var results = [];

	function check(candidates, wrong) {
		for (var i = 0; i < wrong.length; i++) {
			var q = true;

			for (var j = 0; j < candidates.length; j++) {
				if (m[i][j]) {
					q = false;
					break;
				}
			}

			if (q) return false;
		}
		return true;
	}

	function remove(arr, item) {
		var index = arr.indexOf(item);
		if (index > -1) {
			arr.splice(index, 1);
		}
	}

	function extend(compsub, candidates, wrong) {
		while (candidates && check(candidates, wrong)) {
			var v = candidates[0];
			compsub.push(v);

			var filter = function (i) { return (!m[i][v] && i !== v); };
			var newCandidates = candidates.filter(filter);
			var newWrong = wrong.filter(filter);

			if (newCandidates.length === 0 && newWrong.length === 0) {
				results.push(compsub.slice());
			} else {
				extend(compsub, newCandidates, newWrong);
			}

			remove(candidates, v);
			remove(compsub, v);
			wrong.push(v);
		}
	}

	function range(max) {
		var arr = [];
		for (var i = 0; i < max; i++) {
			arr.push(i);
		}
		return arr;
	}

	extend([], range(m.length), []);

	return results;
}