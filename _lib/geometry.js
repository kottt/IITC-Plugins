(function () {
	function pe(a) { return a / (Math.PI / 180); }
	function oe(a) { return Math.PI / 180 * a; }
	function me(a, b, c) {
		c = c - b;
		return ((a - b) % c + c) % c + b;
	}

	function sF(a, b) {
		return Math.abs(me(b - a, -180, 180));
	}

	function tF(a, b, c, d, e) {
		if (!d) {
			c = sF(a.lng(), c) / sF(a.lng(), b.lng());
			if (!e)
				return e = Math.sin(oe(a.lat())), e = Math.log((1 + e) / (1 - e)) / 2, b = Math.sin(oe(b.lat())), b = Math.log((1 + b) / (1 - b)) / 2, pe(2 * Math.atan(Math.exp(e + c * (b - e))) - Math.PI / 2);
			a = e.fromLatLngToPoint(a);
			b = e.fromLatLngToPoint(b);
			return e.fromPointToLatLng(new U(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y))).lat();
		}
		e = oe(a.lat());
		a = oe(a.lng());
		d = oe(b.lat());
		b = oe(b.lng());
		c = oe(c);
		return me(pe(Math.atan2(Math.sin(e) * Math.cos(d) * Math.sin(c - b) - Math.sin(d) * Math.cos(e) * Math.sin(c - a), Math.cos(e) * Math.cos(d) * Math.sin(a - b))), -90, 90);
	}

	var lib = {
		containsLocation: function (a, b) {
			for (var c = me(a.lng(), -180, 180), d = !!b.get("geodesic"), e = b.get("latLngs"), f = b.get("map"), f = !d && f ? f.getProjection() : null, g = false, h = 0, n = e.getLength() ; h < n; ++h)
				for (var r = e.getAt(h), t = 0, x = r.getLength() ; t < x; ++t) {
					var y = r.getAt(t),
						z = r.getAt((t + 1) % x),
						I = me(y.lng(), -180, 180),
						F = me(z.lng(), -180, 180),
						M = Math.max(I, F),
						I = Math.min(I, F);
					(180 < M - I ? c >= M || c < I : c < M && c >= I) && tF(y, z, c, d, f) < a.lat() && (g = !g);
				}
			return g || lib.isLocationOnEdge(a, b);
		},
		isLocationOnEdge: function (a, b, c) {
			c = c || 1E-9;
			var d = me(a.lng(), -180, 180),
				e = b instanceof $h, f = !!b.get("geodesic"), g = b.get("latLngs");
			b = b.get("map");
			b = !f && b ? b.getProjection() : null;
			for (var h = 0, n = g.getLength() ; h < n; ++h)
				for (var r = g.getAt(h), t = r.getLength(), x = e ? t : t - 1, y = 0; y < x; ++y) {
					var z = r.getAt(y),
						I = r.getAt((y + 1) % t),
						F = me(z.lng(), -180, 180),
						M = me(I.lng(), -180, 180),
						V = Math.max(F, M),
						P = Math.min(F, M);
					if (F = 1E-9 >= Math.abs(me(F - M, -180, 180)) && (Math.abs(me(F - d, -180, 180)) <= c || Math.abs(me(M - d, -180, 180)) <= c)) var F = a.lat(),
						M = Math.min(z.lat(), I.lat()) - c,
						L = Math.max(z.lat(), I.lat()) + c,
						F = F >= M && F <= L;
					if (F) return !0;
					if (180 < V - P ? d + c >= V || d - c <= P : d + c >= P && d - c <= V)
						if (z = tF(z, I, d, f, b), Math.abs(z - a.lat()) < c) return !0;
				}
			return !1;
		},
		computeHeading: function (a, b) {
			var c = oe(a.lat()),
				d = oe(b.lat()),
				e = oe(b.lng()) - oe(a.lng());
			return me(pe(Math.atan2(Math.sin(e) * Math.cos(d), Math.cos(c) * Math.sin(d) - Math.sin(c) * Math.cos(d) * Math.cos(e))), -180, 180);
		}
	};
	return lib;
})();