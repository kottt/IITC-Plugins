﻿'use strict'; function sF(a, b) { return m.abs(me(b - a, -180, 180)) }
function tF(a, b, c, d, e) {
	if (!d) {
		c = sF(a.lng(), c) / sF(a.lng(), b.lng());
		if (!e) return e = m.sin(oe(a.lat())), e = m.log((1 + e) / (1 - e)) / 2, b = m.sin(oe(b.lat())), b = m.log((1 + b) / (1 - b)) / 2, pe(2 * m[rc](m.exp(e + c * (b - e))) - m.PI / 2); a = e[xb](a); b = e[xb](b); return e[Sb](new U(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y))).lat()
	}
	e = oe(a.lat());
	a = oe(a.lng());
	d = oe(b.lat());
	b = oe(b.lng());
	c = oe(c);
	return me(pe(m[Uc](m.sin(e) * m.cos(d) * m.sin(c - b) - m.sin(d) * m.cos(e) * m.sin(c - a), m.cos(e) * m.cos(d) * m.sin(a - b))), -90, 90);
}
var uF = {
	containsLocation: function (a, b) { for (var c = me(a.lng(), -180, 180), d = !!b.get("geodesic"), e = b.get("latLngs"), f = b.get("map"), f = !d && f ? f[Rc]() : null, g = !1, h = 0, n = e[nc]() ; h < n; ++h) for (var r = e[hd](h), t = 0, x = r[nc]() ; t < x; ++t) { var y = r[hd](t), z = r[hd]((t + 1) % x), I = me(y.lng(), -180, 180), F = me(z.lng(), -180, 180), M = m.max(I, F), I = m.min(I, F); (180 < M - I ? c >= M || c < I : c < M && c >= I) && tF(y, z, c, d, f) < a.lat() && (g = !g) } return g || uF.isLocationOnEdge(a, b) }, isLocationOnEdge: function (a, b, c) {
		c = c || 1E-9; var d = me(a.lng(), -180, 180), e = b instanceof
		$h, f = !!b.get("geodesic"), g = b.get("latLngs"); b = b.get("map"); b = !f && b ? b[Rc]() : null; for (var h = 0, n = g[nc]() ; h < n; ++h) for (var r = g[hd](h), t = r[nc](), x = e ? t : t - 1, y = 0; y < x; ++y) {
			var z = r[hd](y), I = r[hd]((y + 1) % t), F = me(z.lng(), -180, 180), M = me(I.lng(), -180, 180), V = m.max(F, M), P = m.min(F, M); if (F = 1E-9 >= m.abs(me(F - M, -180, 180)) && (m.abs(me(F - d, -180, 180)) <= c || m.abs(me(M - d, -180, 180)) <= c)) var F = a.lat(), M = m.min(z.lat(), I.lat()) - c, L = m.max(z.lat(), I.lat()) + c, F = F >= M && F <= L; if (F) return !0; if (180 < V - P ? d + c >= V || d - c <= P : d + c >= P && d - c <= V) if (z = tF(z,
			I, d, f, b), m.abs(z - a.lat()) < c) return !0
		} return !1
	}
}; var vF = {
	computeHeading: function(a, b) {
		var c = tf(a),
			d = tf(b),
			e = uf(b) - uf(a);
		return me(pe(m[Uc](m.sin(e) * m.cos(d), m.cos(c) * m.sin(d) - m.sin(c) * m.cos(d) * m.cos(e))), -180, 180);
	},
	computeOffset: function (a, b, c, d) { b /= d || 6378137; c = oe(c); var e = tf(a); d = m.cos(b); b = m.sin(b); var f = m.sin(e), e = m.cos(e), g = d * f + b * e * m.cos(c); return new sf(pe(m[Ec](g)), pe(uf(a) + m[Uc](b * e * m.sin(c), d - f * g))) }, computeOffsetOrigin: function (a, b, c, d) {
		c = oe(c); b /= d || 6378137; d = m.cos(b); var e = m.sin(b) * m.cos(c); b = m.sin(b) * m.sin(c); c = m.sin(tf(a)); var f = e *
		e * d * d + d * d * d * d - d * d * c * c; if (0 > f) return null; var g = e * c + m[Vc](f), g = g / (d * d + e * e), h = (c - e * g) / d, g = m[Uc](h, g); if (g < -m.PI / 2 || g > m.PI / 2) g = e * c - m[Vc](f), g = m[Uc](h, g / (d * d + e * e)); return g < -m.PI / 2 || g > m.PI / 2 ? null : new sf(pe(g), pe(uf(a) - m[Uc](b, d * m.cos(g) - e * m.sin(g))))
	}, interpolate: function (a, b, c) {
		var d = tf(a), e = uf(a), f = tf(b), g = uf(b), h = m.cos(d), n = m.cos(f); b = vF.Df(a, b); var r = m.sin(b); if (1E-6 > r) return new sf(a.lat(), a.lng()); a = m.sin((1 - c) * b) / r; c = m.sin(c * b) / r; b = a * h * m.cos(e) + c * n * m.cos(g); e = a * h * m.sin(e) + c * n * m.sin(g); return new sf(pe(m[Uc](a *
		m.sin(d) + c * m.sin(f), m[Vc](b * b + e * e))), pe(m[Uc](e, b)))
	}, Df: function (a, b) { var c = tf(a), d = tf(b); return 2 * m[Ec](m[Vc](m.pow(m.sin((c - d) / 2), 2) + m.cos(c) * m.cos(d) * m.pow(m.sin((uf(a) - uf(b)) / 2), 2))) }, computeDistanceBetween: function (a, b, c) { return vF.Df(a, b) * (c || 6378137) }, computeLength: function (a, b) { var c = b || 6378137, d = 0; a instanceof sg && (a = a[uc]()); for (var e = 0, f = a[G] - 1; e < f; ++e) d += vF.computeDistanceBetween(a[e], a[e + 1], c); return d }, computeArea: function (a, b) { return m.abs(vF.computeSignedArea(a, b)) }, computeSignedArea: function (a,
	b) { var c = b || 6378137; a instanceof sg && (a = a[uc]()); for (var d = a[0], e = 0, f = 1, g = a[G] - 1; f < g; ++f) e += vF.nm(d, a[f], a[f + 1]); return e * c * c }, nm: function (a, b, c) { return vF.om(a, b, c) * vF.zn(a, b, c) }, om: function (a, b, c) { var d = [a, b, c, a]; a = []; for (c = b = 0; 3 > c; ++c) a[c] = vF.Df(d[c], d[c + 1]), b += a[c]; b /= 2; d = m.tan(b / 2); for (c = 0; 3 > c; ++c) d *= m.tan((b - a[c]) / 2); return 4 * m[rc](m[Vc](m.abs(d))) }, zn: function (a, b, c) {
		a = [a, b, c]; b = []; for (c = 0; 3 > c; ++c) { var d = a[c], e = tf(d), d = uf(d), f = b[c] = []; f[0] = m.cos(e) * m.cos(d); f[1] = m.cos(e) * m.sin(d); f[2] = m.sin(e) } return 0 <
		b[0][0] * b[1][1] * b[2][2] + b[1][0] * b[2][1] * b[0][2] + b[2][0] * b[0][1] * b[1][2] - b[0][0] * b[2][1] * b[1][2] - b[1][0] * b[0][1] * b[2][2] - b[2][0] * b[1][1] * b[0][2] ? 1 : -1
	}
}; var wF = {
	decodePath: function (a) { for (var b = ge(a), c = ca(m[zb](a[G] / 2)), d = 0, e = 0, f = 0, g = 0; d < b; ++g) { var h = 1, n = 0, r; do r = a[od](d++) - 63 - 1, h += r << n, n += 5; while (31 <= r); e += h & 1 ? ~(h >> 1) : h >> 1; h = 1; n = 0; do r = a[od](d++) - 63 - 1, h += r << n, n += 5; while (31 <= r); f += h & 1 ? ~(h >> 1) : h >> 1; c[g] = new sf(1E-5 * e, 1E-5 * f, !0) } fb(c, g); return c }, encodePath: function (a) { a instanceof sg && (a = a[uc]()); return wF.To(a, function (a) { return [m[E](1E5 * a.lat()), m[E](1E5 * a.lng())] }) }, To: function (a, b) {
		for (var c = [], d = [0, 0], e, f = 0, g = ge(a) ; f < g; ++f) e = b ? b(a[f]) : a[f], wF.Si(e[0] -
		d[0], c), wF.Si(e[1] - d[1], c), d = e; return c[wd]("")
	}, Eq: function (a) { for (var b = ge(a), c = ca(b), d = 0; d < b; ++d) c[d] = a[od](d) - 63; return c }, Si: function (a, b) { return wF.Uo(0 > a ? ~(a << 1) : a << 1, b) }, Uo: function (a, b) { for (; 32 <= a;) b[D](la[Sc]((32 | a & 31) + 63)), a >>= 5; b[D](la[Sc](a + 63)); return b }
}; Jh.geometry = function (a) { eval(a) }; Sd[bd].maps.geometry = { encoding: wF, spherical: vF, poly: uF }; function xF() { } N = xF[H]; N.decodePath = wF.decodePath; N.encodePath = wF.encodePath; N.computeDistanceBetween = vF.computeDistanceBetween; N.interpolate = vF.interpolate; N.computeHeading = vF[Pc]; N.computeOffset = vF.computeOffset; N.computeOffsetOrigin = vF.computeOffsetOrigin; hg("geometry", new xF);
