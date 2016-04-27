(function () {
	var TYPE = {
		Deleted: -1,
		Regular: 0,
		Income: 2,
		IncomeLeft: 3,
		IncomeRight: 4,
		Outcome: 9,
		Opposite: 10
	};

	function UltraUp(map, allPoints, deleted, outcomeIndexes, oppositeIndex) {
		this.map = map;
		this.allPoints = [];
		for (var i = 0; i < allPoints.length; i++) {
			this.allPoints.push({
				latlng: allPoints[i],
				index: i,
				type: TYPE.Regular
			});
		}

		this.outcomePoints = [];
		outcomeIndexes.forEach(function (i) {
			var point = this.allPoints[i];
			point.type = TYPE.Outcome;
			point.color = "red";//"";//"blue";
			this.outcomePoints.push(point);
		}, this);
		deleted.forEach(function (i) {
			this.allPoints[i].type = TYPE.Deleted;
		}, this);

		this.oppositePoint = this.allPoints[oppositeIndex];
		this.oppositePoint.type = TYPE.Opposite;
		this.oppositePoint.color = "Fuchsia";

		this.availablePoints = this.allPoints.filter(function (point) { return point.type === TYPE.Regular; });

		document.getElementById("left").onclick = function () {
			if (!!this.leftVariants) {
				if (this.leftIndex === undefined) {
					this.leftIndex = 0;
				}
				this.drawVariant(this.leftPoints, this.leftVariants[this.leftIndex]);
				console.log("Variant length: " + this.leftVariants[this.leftIndex].length);
				this.leftIndex++;
				if (this.leftIndex >= this.leftVariants.length) {
					this.leftIndex = 0;
				}
			}
		}.bind(this);
		document.getElementById("right").onclick = function () {
			if (!!this.rightVariants) {
				if (this.rightIndex === undefined) {
					this.rightIndex = 0;
				}
				this.drawVariant(this.rightPoints, this.rightVariants[this.rightIndex]);
				console.log("Variant length: " + this.rightVariants[this.rightIndex].length);
				this.rightIndex++;
				if (this.rightIndex >= this.rightVariants.length) {
					this.rightIndex = 0;
				}
			}
		}.bind(this);
	}

	//#region Icons

	var iconCache = {};

	function getIconByCode(color) {
		return {
			url: "http://localhost:88/Marker/Circle?color=" + color,
			size: new google.maps.Size(20, 20),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(10, 10)
		};
	}

	function getIconByName(color) {
		return {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: color,
			fillOpacity: .8,
			strokeColor: color,
			strokeWeight: .5,
			scale: 4
		}
	}

	function getIcon(color) {
		var icon = iconCache[color];
		if (!icon) {
			if (color.indexOf(",") > -1) {
				icon = getIconByCode(color);
			} else {
				icon = getIconByName(color);
			}
			iconCache[color] = icon;
		}
		return icon;
	}

	//#endregion

	//#region Geometry

	function toLatLng(point) {
		return new window.google.maps.LatLng(point.latlng.lat, point.latlng.lng);
	}

	function getAngleSign(ab, b, c) {
		var bc = window.google.maps.geometry.spherical.computeHeading(b, c);
		return Math.sign(Math.sin(Math.PI * ((ab - bc) / 180)));
	}

	function getEdges(outcomePoints, oppositePoint) {
		// бежим по всем, ищем такие, у которых знак для всех остальных будет одинаковым
		var result = {
			negative: null,
			positive: null
		};
		for (var i = 0; i < outcomePoints.length; i++) {
			var point = outcomePoints[i];
			var edge = window.google.maps.geometry.spherical.computeHeading(point, oppositePoint);

			var angleSign = null;
			for (var j = 0; j < outcomePoints.length; j++) {
				if (j === i) continue;

				var currentSign = getAngleSign(edge, outcomePoints[j], point);
				if (angleSign === null) {
					angleSign = currentSign;
				} else if (currentSign !== angleSign) {
					angleSign = null;
					break;
				}
			}

			if (angleSign === null || angleSign === 0) continue;
			if (angleSign < 0) {
				result.negative = edge;
			} else {
				result.positive = edge;
			}
		}
		return result.negative === null || result.positive === null ? null : result;
	}


	function isGoodPair(a, b, outcomePoints, oppositePoint) {
		var ab = window.google.maps.geometry.spherical.computeHeading(a, b);

		var angleSign = null;
		for (var i = 0; i < outcomePoints.length; i++) {
			var currenctSign = getAngleSign(ab, b, outcomePoints[i]);
			if (angleSign !== null && angleSign !== currenctSign) {
				return false;
			}
			angleSign = currenctSign;

			if (getAngleSign(ab, b, oppositePoint) == currenctSign) {
				return false;
			}
		}
		return true;
	}

	//#endregion

	function extend(obj1, obj2) {
		for (var attrname in obj2) {
			if (obj2.hasOwnProperty(attrname)) {
				obj1[attrname] = obj2[attrname];
			}
		}
		return obj1;
	}

	function getMaxSequense(oppositePoint, outcome, income) {
		var pairsGraph = [];
		for (var i = 0; i < income.length; i++) {
			var row = [];
			for (var j = 0; j < income.length; j++) {
				row.push(!isGoodPair(income[i], income[j], outcome, oppositePoint));
			}
			pairsGraph.push(row);
		}
		console.log("graph OK");
		return BronKerboschMaxByInclusion(pairsGraph);
	}

	UltraUp.prototype = {
		drawPoint: function (point) {
			var marker = new window.google.maps.Marker({
				position: point.latlng,
				map: this.map,
				icon: getIcon(point.color)
			});

			point.marker = marker;
			point.selected = false;

			point.setIcon = function (color) {
				point.marker.setIcon(getIcon(color));
			}

			//marker.addListener("click", function () {
			//	point.selected = !point.selected;
			//	var icon = getIcon(point.selected ? "white" : point.color);
			//	marker.setIcon(icon);

			//	console.log(point.index);
			//});
		},
		drawAll: function (color) {
			this.allPoints.forEach(function (point) {
				if (point.type === TYPE.Regular) {
					point.color = color;
				}
				if (point.type > 5) {// !== TYPE.Deleted) {
					this.drawPoint(point);
				}
			}, this);
		},

		paintSets: function () {
			var oppositeLatlng = toLatLng(this.oppositePoint),
				edges = getEdges(this.outcomePoints.map(toLatLng), oppositeLatlng);
			if (edges === null || edges === undefined) return;

			this.leftPoints = this.availablePoints.filter(function (point) { return getAngleSign(edges.negative, oppositeLatlng, toLatLng(point)) < 0; }, this);
			this.rightPoints = this.availablePoints.filter(function (point) { return getAngleSign(edges.positive, oppositeLatlng, toLatLng(point)) > 0; }, this);

			var setClickListener = function (point, set, type) {
				return false;
				window.google.maps.event.clearListeners(point.marker, "click");
				point.marker.addListener("click", function () {
					point.type = TYPE.Deleted;
					point.marker.setMap(null);

					set = set.filter(function (point) { return point.type === type; });
					if (type === TYPE.IncomeLeft) {
						this.leftPoints = set;
					} else if (type === TYPE.IncomeRight) {
						this.rightPoints = set;
					}
					this.checkGoodness(set);
				}.bind(this));
			}.bind(this);

			this.leftPoints.forEach(function (point) {
				point.type = TYPE.IncomeLeft;
				point.color = "0,255,85";
				point.setIcon(point.color);

				setClickListener(point, this.leftPoints, TYPE.IncomeLeft);
			}, this);
			this.rightPoints.forEach(function (point) {
				point.type = TYPE.IncomeRight;
				point.color = "236,255,35";
				point.setIcon(point.color);

				setClickListener(point, this.rightPoints, TYPE.IncomeRight);
			}, this);

			this.availablePoints.forEach(function (point) {
				if (point.type === TYPE.Regular) {
					point.marker.setMap(null);
				}
			});
		},

		checkGoodness: function(points) {
			var latlngs = [],
				outcomeLatlngs = this.outcomePoints.map(toLatLng),
				oppositeLatlng = toLatLng(this.oppositePoint);

			for (var i = 0; i < points.length; i++) {
				latlngs.push({
					latlng: toLatLng(points[i]),
					index: i
				});
			}

			var positionsMatrix = [];

			function getLinkingOrder(a, sortMultiplier) {
				function computeHeading(b) {
					var x = {
						index: b.index,
						heading: window.google.maps.geometry.spherical.computeHeading(a, b.latlng)
					};
					if (x.heading < 0) x.heading = 360 + x.heading;
					return x;
				}

				var indexes = latlngs
					.map(computeHeading)
					.sort(function (a, b) { return (a.heading < b.heading) * sortMultiplier; })
					.map(function (item) { return item.index; });

				var flippedIndexes = [];
				for (var i = 0; i < indexes.length; i++) {
					flippedIndexes[indexes[i]] = i;
				}

				return flippedIndexes;
			}
			//positionsMatrix.push(getLinkingOrder(oppositeLatlng, -1));
			outcomeLatlngs.forEach(function (latlng) {
				positionsMatrix.push(getLinkingOrder(latlng, 1));
			});

			function getUniquesCountInColumn(column) {
				var u = {}, a = [];
				for (var row = 0; row < positionsMatrix.length; row++) {
					var value = positionsMatrix[row][column];
					if (u.hasOwnProperty(value)) {
						continue;
					}
					a.push(value);
					u[value] = 1;
				}

				return a.length;
			}

			function getColor(movements) {
				if (movements == 1) {
					return "green";
				}

				var x = 50 + movements * 3;
				if (x > 255) x = 255 - x;
				return "" + "255," + x + ",255";
			}

			for (var i = 0; i < points.length; i++) {
				var point = points[i];
				point.movements = getUniquesCountInColumn(i);
				point.setIcon(getColor(point.movements));
			}
		},

		maxIncomeSet: function (incomePoints, minGoodVariant) {

			console.log(incomePoints.length);

			var maxSequesnes = getMaxSequense(toLatLng(this.oppositePoint), this.outcomePoints.map(toLatLng), incomePoints.map(toLatLng));
			if (maxSequesnes.length === 0) {
				console.log("Empty sequense :(");
				return;
			}

			maxSequesnes.sort(function (a, b) { return b.length - a.length; });
			var maxLength = maxSequesnes[0].length;
			console.log("maxLength sequense: ", maxLength);

			var variants = []
			maxSequesnes.forEach(function (sequense) {
				if (sequense.length === maxLength || sequense.length >= minGoodVariant) {
					variants.push(sequense);
				}
			});

			this.maxSequesnes = maxSequesnes;
			this.variants = variants;
			return variants;
		},

		drawPoly: function (path, color, params) {
			params = extend({
				fillColor: color,
				fillOpacity: .4,
				strokeColor: color,
				strokeOpacity: 1.0,
				strokeWeight: 1,
				geodesic: true,
				path: path,
				map: this.map,
			}, params || {});

			return new google.maps.Polygon(params);
		},

		drawVariant: function (incomePoints, indexes) {
			incomePoints.forEach(function (point) {
				point.setIcon(point.color);
			});
			indexes.forEach(function (index) {
				var point = incomePoints[index];
				point.setIcon("black");
			});

			for (var i = 0; i < indexes.length - 1; i++) {
				var path = [incomePoints[indexes[i]], incomePoints[indexes[i + 1]], this.oppositePoint].map(toLatLng);
				this.drawPoly(path, "DeepSkyBlue");
			}
		},

		drawByGlobalIndexes: function (indexes) {
			var points = [];
			indexes.forEach(function (index) {
				var point = this.allPoints[index];
				this.drawPoint(point);

				point.setIcon("DodgerBlue");
				points.push(point);
			}, this);

			for (var i = 0; i < points.length - 1; i++) {
				var path = [points[i], points[i + 1], this.oppositePoint].map(toLatLng);
				this.drawPoly(path, "DeepSkyBlue", { strokeColor: "black" });
			}
		},

		fields: [],

		drawFieldsVariant: function (points, outcomePoint) {
			this.drawOutcomePoints("red");
			this.resetFields(points);

			outcomePoint.setIcon("Fuchsia");

			for (var i = 0; i < points.length - 1; i++) {
				var path = [points[i], points[i + 1], outcomePoint].map(toLatLng);
				this.fields.push(this.drawPoly(path, "DeepSkyBlue"));
			}
		},

		drawOutcomePoints: function (color) {
			this.outcomePoints.forEach(function (point) {
				point.marker.setIcon(getIcon(color));
			});
		},

		resetFields: function () {
			
			this.fields.forEach(function (poly) { poly.setMap(null) });
			this.fields = [];
		},

		drawFieldsVariant2: function (point, outcomePoint) {
			var path = [point, this.oppositePoint, outcomePoint].map(toLatLng);
			this.fields.push(this.drawPoly(path, "DeepSkyBlue", { strokeColor: "black"}));
		}
	};

	window.UltraUp = UltraUp;
})();