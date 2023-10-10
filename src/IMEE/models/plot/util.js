/* eslint-disable */
const Cesium3DTileFeature = Cesium.Cesium3DTileFeature
export function getCatesian3FromPX(px, viewer) {
	var picks = viewer.scene.drillPick(px)
	viewer.render()
	var cartesian
	var isOn3dtiles = false
	// var isOn3dtiles = true
	// for (var i = 0; i < picks.length; i++) {
	//   if ((picks[i] && picks[i].primitive) || picks[i] instanceof Cesium3DTileFeature) { // 模型上拾取
	//     isOn3dtiles = true
	//   }
	// }

	if (isOn3dtiles) {
		cartesian = viewer.scene.pickPosition(px)
	} else {
		var ray = viewer.camera.getPickRay(px)
		if (!ray) return null
		cartesian = viewer.scene.globe.pick(ray, viewer.scene)
	}
	return cartesian
}

export const P = {}
;(P.PlotUtils = {}),
	(P.PlotUtils.distance = function (t, o) {
		return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
	}),
	(P.PlotUtils.wholeDistance = function (t) {
		for (var o = 0, e = 0; e < t.length - 1; e++)
			o += P.PlotUtils.distance(t[e], t[e + 1])
		return o
	}),
	(P.PlotUtils.getBaseLength = function (t) {
		return Math.pow(P.PlotUtils.wholeDistance(t), 0.99)
	}),
	(P.PlotUtils.mid = function (t, o) {
		return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
	}),
	(P.PlotUtils.getCircleCenterOfThreePoints = function (t, o, e) {
		var r = [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
		var n = [r[0] - t[1] + o[1], r[1] + t[0] - o[0]]
		var g = [(t[0] + e[0]) / 2, (t[1] + e[1]) / 2]
		var i = [g[0] - t[1] + e[1], g[1] + t[0] - e[0]]
		return P.PlotUtils.getIntersectPoint(r, n, g, i)
	}),
	(P.PlotUtils.getIntersectPoint = function (t, o, e, r) {
		if (t[1] == o[1]) {
			var n = (r[0] - e[0]) / (r[1] - e[1])
			var g = n * (t[1] - e[1]) + e[0]
			var i = t[1]
			return [g, i]
		}
		if (e[1] == r[1]) {
			var s = (o[0] - t[0]) / (o[1] - t[1])
			return (g = s * (e[1] - t[1]) + t[0]), (i = e[1]), [g, i]
		}
		return (
			(s = (o[0] - t[0]) / (o[1] - t[1])),
			(n = (r[0] - e[0]) / (r[1] - e[1])),
			(i = (s * t[1] - t[0] - n * e[1] + e[0]) / (s - n)),
			(g = s * i - s * t[1] + t[0]),
			[g, i]
		)
	}),
	(P.PlotUtils.getAzimuth = function (t, o) {
		var e
		var r = Math.asin(Math.abs(o[1] - t[1]) / P.PlotUtils.distance(t, o))
		return (
			o[1] >= t[1] && o[0] >= t[0]
				? (e = r + Math.PI)
				: o[1] >= t[1] && o[0] < t[0]
				? (e = P.Constants.TWO_PI - r)
				: o[1] < t[1] && o[0] < t[0]
				? (e = r)
				: o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r),
			e
		)
	}),
	(P.PlotUtils.getAngleOfThreePoints = function (t, o, e) {
		var r = P.PlotUtils.getAzimuth(o, t) - P.PlotUtils.getAzimuth(o, e)
		return r < 0 ? r + P.Constants.TWO_PI : r
	}),
	(P.PlotUtils.isClockWise = function (t, o, e) {
		return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
	}),
	(P.PlotUtils.getPointOnLine = function (t, o, e) {
		var r = o[0] + t * (e[0] - o[0])
		var n = o[1] + t * (e[1] - o[1])
		return [r, n]
	}),
	(P.PlotUtils.getCubicValue = function (t, o, e, r, n) {
		t = Math.max(Math.min(t, 1), 0)
		var g = 1 - t
		var i = t * t
		var s = i * t
		var a = g * g
		var l = a * g
		var u = l * o[0] + 3 * a * t * e[0] + 3 * g * i * r[0] + s * n[0]
		var c = l * o[1] + 3 * a * t * e[1] + 3 * g * i * r[1] + s * n[1]
		return [u, c]
	}),
	(P.PlotUtils.getThirdPoint = function (t, o, e, r, n) {
		var g = P.PlotUtils.getAzimuth(t, o)
		var i = n ? g + e : g - e
		var s = r * Math.cos(i)
		var a = r * Math.sin(i)
		return [o[0] + s, o[1] + a]
	}),
	(P.PlotUtils.getArcPoints = function (t, o, e, r) {
		var n
		var g
		var i = []
		var s = r - e
		s = s < 0 ? s + P.Constants.TWO_PI : s
		for (var a = 0; a <= P.Constants.FITTING_COUNT; a++) {
			var l = e + (s * a) / P.Constants.FITTING_COUNT
			;(n = t[0] + o * Math.cos(l)),
				(g = t[1] + o * Math.sin(l)),
				i.push([n, g])
		}
		return i
	}),
	(P.PlotUtils.getBisectorNormals = function (t, o, e, r) {
		var n = P.PlotUtils.getNormal(o, e, r)
		var g = Math.sqrt(n[0] * n[0] + n[1] * n[1])
		var i = n[0] / g
		var s = n[1] / g
		var a = P.PlotUtils.distance(o, e)
		var l = P.PlotUtils.distance(e, r)
		if (g > P.Constants.ZERO_TOLERANCE) {
			if (P.PlotUtils.isClockWise(o, e, r)) {
				var u = t * a
				var c = e[0] - u * s
				var p = e[1] + u * i
				var h = [c, p]
				;(u = t * l), (c = e[0] + u * s), (p = e[1] - u * i)
				var d = [c, p]
			} else
				(u = t * a),
					(c = e[0] + u * s),
					(p = e[1] - u * i),
					(h = [c, p]),
					(u = t * l),
					(c = e[0] - u * s),
					(p = e[1] + u * i),
					(d = [c, p])
		} else
			(c = e[0] + t * (o[0] - e[0])),
				(p = e[1] + t * (o[1] - e[1])),
				(h = [c, p]),
				(c = e[0] + t * (r[0] - e[0])),
				(p = e[1] + t * (r[1] - e[1])),
				(d = [c, p])
		return [h, d]
	}),
	(P.PlotUtils.getNormal = function (t, o, e) {
		var r = t[0] - o[0]
		var n = t[1] - o[1]
		var g = Math.sqrt(r * r + n * n)
		;(r /= g), (n /= g)
		var i = e[0] - o[0]
		var s = e[1] - o[1]
		var a = Math.sqrt(i * i + s * s)
		;(i /= a), (s /= a)
		var l = r + i
		var u = n + s
		return [l, u]
	}),
	(P.PlotUtils.getCurvePoints = function (t, o) {
		for (
			var e = P.PlotUtils.getLeftMostControlPoint(o), r = [e], n = 0;
			n < o.length - 2;
			n++
		) {
			var g = o[n]
			var i = o[n + 1]
			var s = o[n + 2]
			var a = P.PlotUtils.getBisectorNormals(t, g, i, s)
			r = r.concat(a)
		}
		var l = P.PlotUtils.getRightMostControlPoint(o)
		r.push(l)
		var u = []
		for (n = 0; n < o.length - 1; n++) {
			;(g = o[n]), (i = o[n + 1]), u.push(g)
			for (var t = 0; t < P.Constants.FITTING_COUNT; t++) {
				var c = P.PlotUtils.getCubicValue(
					t / P.Constants.FITTING_COUNT,
					g,
					r[2 * n],
					r[2 * n + 1],
					i
				)
				u.push(c)
			}
			u.push(i)
		}
		return u
	}),
	(P.PlotUtils.getLeftMostControlPoint = function (o) {
		var e = o[0]
		var r = o[1]
		var n = o[2]
		var g = P.PlotUtils.getBisectorNormals(0, e, r, n)
		var i = g[0]
		var s = P.PlotUtils.getNormal(e, r, n)
		var a = Math.sqrt(s[0] * s[0] + s[1] * s[1])
		if (a > P.Constants.ZERO_TOLERANCE) {
			var l = P.PlotUtils.mid(e, r)
			var u = e[0] - l[0]
			var c = e[1] - l[1]
			var p = P.PlotUtils.distance(e, r)
			var h = 2 / p
			var d = -h * c
			var f = h * u
			var E = d * d - f * f
			var v = 2 * d * f
			var A = f * f - d * d
			var _ = i[0] - l[0]
			var y = i[1] - l[1]
			var m = l[0] + E * _ + v * y
			var O = l[1] + v * _ + A * y
		} else (m = e[0] + t * (r[0] - e[0])), (O = e[1] + t * (r[1] - e[1]))
		return [m, O]
	}),
	(P.PlotUtils.getRightMostControlPoint = function (o) {
		var e = o.length
		var r = o[e - 3]
		var n = o[e - 2]
		var g = o[e - 1]
		var i = P.PlotUtils.getBisectorNormals(0, r, n, g)
		var s = i[1]
		var a = P.PlotUtils.getNormal(r, n, g)
		var l = Math.sqrt(a[0] * a[0] + a[1] * a[1])
		if (l > P.Constants.ZERO_TOLERANCE) {
			var u = P.PlotUtils.mid(n, g)
			var c = g[0] - u[0]
			var p = g[1] - u[1]
			var h = P.PlotUtils.distance(n, g)
			var d = 2 / h
			var f = -d * p
			var E = d * c
			var v = f * f - E * E
			var A = 2 * f * E
			var _ = E * E - f * f
			var y = s[0] - u[0]
			var m = s[1] - u[1]
			var O = u[0] + v * y + A * m
			var T = u[1] + A * y + _ * m
		} else (O = g[0] + t * (n[0] - g[0])), (T = g[1] + t * (n[1] - g[1]))
		return [O, T]
	}),
	(P.PlotUtils.getBezierPoints = function (t) {
		if (t.length <= 2) return t
		for (var o = [], e = t.length - 1, r = 0; r <= 1; r += 0.01) {
			for (var n = (y = 0), g = 0; e >= g; g++) {
				var i = P.PlotUtils.getBinomialFactor(e, g)
				var s = Math.pow(r, g)
				var a = Math.pow(1 - r, e - g)
				;(n += i * s * a * t[g][0]), (y += i * s * a * t[g][1])
			}
			o.push([n, y])
		}
		return o.push(t[e]), o
	}),
	(P.PlotUtils.getBinomialFactor = function (t, o) {
		return (
			P.PlotUtils.getFactorial(t) /
			(P.PlotUtils.getFactorial(o) * P.PlotUtils.getFactorial(t - o))
		)
	}),
	(P.PlotUtils.getFactorial = function (t) {
		if (t <= 1) return 1
		if (t == 2) return 2
		if (t == 3) return 6
		if (t == 4) return 24
		if (t == 5) return 120
		for (var o = 1, e = 1; t >= e; e++) o *= e
		return o
	}),
	(P.PlotUtils.getQBSplinePoints = function (t) {
		if (t.length <= 2) return t
		var o = 2
		var e = []
		var r = t.length - o - 1
		e.push(t[0])
		for (var n = 0; r >= n; n++) {
			for (var g = 0; g <= 1; g += 0.05) {
				for (var i = 0, y = 0, s = 0; o >= s; s++) {
					var a = P.PlotUtils.getQuadricBSplineFactor(s, g)
					;(i += a * t[n + s][0]), (y += a * t[n + s][1])
				}
				e.push([i, y])
			}
		}
		return e.push(t[t.length - 1]), e
	}),
	(P.PlotUtils.getQuadricBSplineFactor = function (t, o) {
		return t == 0
			? Math.pow(o - 1, 2) / 2
			: t == 1
			? (-2 * Math.pow(o, 2) + 2 * o + 1) / 2
			: t == 2
			? Math.pow(o, 2) / 2
			: 0
	}),
	(P.Constants = {
		TWO_PI: 2 * Math.PI,
		HALF_PI: Math.PI / 2,
		FITTING_COUNT: 100,
		ZERO_TOLERANCE: 1e-4,
	})
