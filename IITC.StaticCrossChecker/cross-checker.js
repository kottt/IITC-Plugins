window.geometry = (function () {
	function pe(a) { return a / (Math.PI / 180); }
	function oe(a) { return Math.PI / 180 * a; }
	function me(a, b, c) {
		c = c - b;
		return ((a - b) % c + c) % c + b;
	}

	var lib = {
		computeHeading: function (a, b) {
			var c = oe(a.lat),
				d = oe(b.lat),
				e = oe(b.lng) - oe(a.lng);
			return me(pe(Math.atan2(Math.sin(e) * Math.cos(d), Math.cos(c) * Math.sin(d) - Math.sin(c) * Math.cos(d) * Math.cos(e))), -180, 180);
		}
	};
	return lib;
})();

// lenghts = [25000, 15000, 8000, 4000, 800, 0]
// findPotentialCrosses(link, allPortals, lengths)
window.findPotentialCrosses = (function () {
	/*
	на входе:
	- множество всех порталов
	- две точки, обозначающие проверяемый линк
	- массив с отслеживаемыми длинами линков
	
	в первый проход:
	- проверяем кратчайшее расстояние до отрезка
	- если меньше максимальной отслеживаемой длины, сохраняем точку

	всем сохраненным точкам считаем:
	- хединги до одного и второго концов отрезка
	- сторону, с которой находится точка относительно прямой, продолжающей наш отрезок ("левая" или "правая")
	
	бежим по всем "левым" точкам и проверяем для каждой "правой":
	- что она попадает в угол между одним и вторым концом отрезка
	- считаем расстояние между ними и если подходит - кладем в коллекцию, соответствующую одной из длин отрезков

	*/

	function getHeading(a, b) {
		return window.geometry.computeHeading(a, b);
	}

	function getAngleByHeadings(ab, bc) {
		return Math.PI * ((ab - bc) / 180);
	}

	function getAngleByPoints(a, b, c) {
		return getAngleByHeadings(getHeading(a, b), getHeading(b, c));
	}

	var rad = function (x) {
		return x * Math.PI / 180;
	};

	// returns the distance in meter
	var getDistance = function (p1, p2) {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(p2.lat - p1.lat);
		var dLong = rad(p2.lng - p1.lng);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
			Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	};


	function PointInfo(link, point) {
		var a = link.a,
			b = link.b;
		var angle = getAngleByHeadings(getHeading(a, point), getHeading(point, b));
		if (angle > Math.PI) {
			a = link.b, b = link.a;
			this.side = -1;
		} else {
			this.side = 1;
		}

		var bap = getAngleByPoints(b, a, point),
			abp = getAngleByPoints(a, b, point);

		this.distanceToLink = bap < Math.PI / 2 && abp < Math.PI / 2
			? getDistance(a, point) * Math.sin(bap)
			: Math.min(getDistance(a, point), getDistance(b, point));

		this.isCrossing = function (secondPoint) {
			var xap = getAngleByPoints(secondPoint, a, point),
				xbp = getAngleByPoints(secondPoint, b, point);

			return (xap > bap && xbp > abp);
		};
	}

	// lenghts = [25000, 15000, 8000, 4000, 800, 0]
	function getLenghtIndex(length, lengths) {
		for (var i = 0; i < lengths.length; i++) {
			if (length >= lengths[i]) {
				return i - 1;
			}
		}
		return -1;
	}

	function findPotentialCrosses(link, portals, lengths) {
		var maxLinkLenght = lengths[0];

		var filteredPortals = portals
			.map(function(point) {
				return new PointInfo(link, point);
			})
			.filter(function (point) {
				return point.distanceToLink <= maxLinkLenght;
			});

		var leftPortals = filteredPortals.filter(function(portal) {
			return portal.pointInfo.side < 0;
		});
		var rightPortals = filteredPortals.filter(function (portal) {
			return portal.pointInfo.side > 0;
		});


		var crossGroups = [];

		leftPortals.forEach(function(leftPortal) {
			rightPortals.forEach(function(rightPortal) {
				if (!leftPortal.isCrossing(rightPortal)) {
					return;
				}

				var lenght = getDistance(leftPortal, rightPortal);
				var index = getLenghtIndex(lenght, lengths);
				if (index < 0) {
					return;
				}

				var crosses = crossGroups[index];
				if (!crosses) {
					crosses = [];
					crossGroups[index] = crosses;
				}
				crosses.push({ a: leftPortal, b: rightPortal });
			});
		});

		return crossGroups;
	}

	return findPotentialCrosses;
})();