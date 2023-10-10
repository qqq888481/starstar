/* eslint-disable */
import { P } from './util'

const Cartesian3 = Cesium.Cartesian3
export const xp = {}

var doubleArrowDefualParam = {
	type: 'doublearrow',
	headHeightFactor: 0.25,
	headWidthFactor: 0.3,
	neckHeightFactor: 0.85,
	fixPointCount: 4,
	neckWidthFactor: 0.15,
}
var tailedAttackArrowDefualParam = {
	headHeightFactor: 0.18,
	headWidthFactor: 0.3,
	neckHeightFactor: 0.85,
	neckWidthFactor: 0.15,
	tailWidthFactor: 0.1,
	headTailFactor: 0.8,
	swallowTailFactor: 1,
}
var fineArrowDefualParam = {
	tailWidthFactor: 0.005,
	neckWidthFactor: 0.02,
	headWidthFactor: 0.03,
	headAngle: Math.PI / 8.5,
	neckAngle: Math.PI / 13,
}
xp.algorithm = {}
;(xp.algorithm.doubleArrow = function (inputPoint) {
	this.connPoint = null
	this.tempPoint4 = null
	this.points = inputPoint
	var result = {
		controlPoint: null,
		polygonalPoint: null,
	}
	// 获取已经点击的坐标数
	var t = inputPoint.length
	if (!(t < 2)) {
		if (t == 2) return inputPoint
		var o = this.points[0] // 第一个点
		var e = this.points[1] // 第二个点
		var r = this.points[2] // 第三个点
		var t = inputPoint.length // 获取已经点击的坐标数
		// 下面的是移动点位后的坐标
		t == 3
			? (this.tempPoint4 = xp.algorithm.getTempPoint4(o, e, r))
			: (this.tempPoint4 = this.points[3]),
			t == 3 || t == 4
				? (this.connPoint = P.PlotUtils.mid(o, e))
				: (this.connPoint = this.points[4])
		var n, g
		P.PlotUtils.isClockWise(o, e, r)
			? ((n = xp.algorithm.getArrowPoints(
					o,
					this.connPoint,
					this.tempPoint4,
					!1
			  )),
			  (g = xp.algorithm.getArrowPoints(this.connPoint, e, r, !0)))
			: ((n = xp.algorithm.getArrowPoints(e, this.connPoint, r, !1)),
			  (g = xp.algorithm.getArrowPoints(
					this.connPoint,
					o,
					this.tempPoint4,
					!0
			  )))
		var i = n.length
		var s = (i - 5) / 2
		var a = n.slice(0, s)
		var l = n.slice(s, s + 5)
		var u = n.slice(s + 5, i)
		var c = g.slice(0, s)
		var p = g.slice(s, s + 5)
		var h = g.slice(s + 5, i)
		c = P.PlotUtils.getBezierPoints(c)
		var d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)))
		u = P.PlotUtils.getBezierPoints(u)
		var f = c.concat(p, d, l, u)
		var newArray = xp.algorithm.array2Dto1D(f)
		result.controlPoint = [o, e, r, this.tempPoint4, this.connPoint]
		result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
	}
	return result
}),
	(xp.algorithm.threeArrow = function (inputPoint) {
		this.connPoint = null
		this.tempPoint4 = null
		this.tempPoint5 = null
		this.points = inputPoint
		var result = {
			controlPoint: null,
			polygonalPoint: null,
		}
		// 获取已经点击的坐标数
		var t = inputPoint.length
		if (t >= 2) {
			if (t == 2) {
				return inputPoint
			}
			var o = this.points[0] // 第一个点
			var e = this.points[1] // 第二个点
			var r = this.points[2] // 第三个点
			var t = inputPoint.length // 获取已经点击的坐标数
			// 下面的是移动点位后的坐标
			if (t == 3) {
				this.tempPoint4 = xp.algorithm.getTempPoint4(o, e, r)
				this.tempPoint5 = P.PlotUtils.mid(r, this.tempPoint4)
			} else {
				this.tempPoint4 = this.points[3]
				this.tempPoint5 = this.points[4]
			}
			if (t < 6) {
				this.connPoint = P.PlotUtils.mid(o, e)
			} else {
				this.connPoint = this.points[5]
			}
			var n, g
			if (P.PlotUtils.isClockWise(o, e, r)) {
				n = xp.algorithm.getArrowPoints(o, this.connPoint, this.tempPoint4, !1)
				g = xp.algorithm.getArrowPoints(this.connPoint, e, r, !0)
			} else {
				n = xp.algorithm.getArrowPoints(e, this.connPoint, r, !1)
				g = xp.algorithm.getArrowPoints(this.connPoint, o, this.tempPoint4, !0)
			}
			var i = n.length
			var s = (i - 5) / 2
			var a = n.slice(0, s)
			var l = n.slice(s, s + 5)
			var u = n.slice(s + 5, i)
			var c = g.slice(0, s)
			var p = g.slice(s, s + 5)
			var h = g.slice(s + 5, i)
			c = P.PlotUtils.getBezierPoints(c)
			var d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)))
			u = P.PlotUtils.getBezierPoints(u)
			var f = c.concat(p, d, l, u)
			var newArray = xp.algorithm.array2Dto1D(f)
			result.controlPoint = [
				o,
				e,
				r,
				this.tempPoint4,
				this.tempPoint5,
				this.connPoint,
			]
			result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
		}
		return result
	}),
	(xp.algorithm.array2Dto1D = function (array) {
		var newArray = []
		array.forEach(function (elt) {
			newArray.push(elt[0])
			newArray.push(elt[1])
		})
		return newArray
	}),
	(xp.algorithm.getArrowPoints = function (t, o, e, r) {
		;(this.type = doubleArrowDefualParam.type),
			(this.headHeightFactor = doubleArrowDefualParam.headHeightFactor),
			(this.headWidthFactor = doubleArrowDefualParam.headWidthFactor),
			(this.neckHeightFactor = doubleArrowDefualParam.neckHeightFactor),
			(this.neckWidthFactor = doubleArrowDefualParam.neckWidthFactor)
		var n = P.PlotUtils.mid(t, o)
		var g = P.PlotUtils.distance(n, e)
		var i = P.PlotUtils.getThirdPoint(e, n, 0, 0.3 * g, !0)
		var s = P.PlotUtils.getThirdPoint(e, n, 0, 0.5 * g, !0)
		;(i = P.PlotUtils.getThirdPoint(n, i, P.Constants.HALF_PI, g / 5, r)),
			(s = P.PlotUtils.getThirdPoint(n, s, P.Constants.HALF_PI, g / 4, r))
		var a = [n, i, s, e]
		var l = xp.algorithm.getArrowHeadPoints(
			a,
			this.headHeightFactor,
			this.headWidthFactor,
			this.neckHeightFactor,
			this.neckWidthFactor
		)
		var u = l[0]
		var c = l[4]
		var p = P.PlotUtils.distance(t, o) / P.PlotUtils.getBaseLength(a) / 2
		var h = xp.algorithm.getArrowBodyPoints(a, u, c, p)
		var d = h.length
		var f = h.slice(0, d / 2)
		var E = h.slice(d / 2, d)
		return (
			f.push(u),
			E.push(c),
			(f = f.reverse()),
			f.push(o),
			(E = E.reverse()),
			E.push(t),
			f.reverse().concat(l, E)
		)
	}),
	(xp.algorithm.getArrowHeadPoints = function (t, o, e) {
		;(this.type = doubleArrowDefualParam.type),
			(this.headHeightFactor = doubleArrowDefualParam.headHeightFactor),
			(this.headWidthFactor = doubleArrowDefualParam.headWidthFactor),
			(this.neckHeightFactor = doubleArrowDefualParam.neckHeightFactor),
			(this.neckWidthFactor = doubleArrowDefualParam.neckWidthFactor)
		var r = P.PlotUtils.getBaseLength(t)
		var n = r * this.headHeightFactor
		var g = t[t.length - 1]
		var i = (P.PlotUtils.distance(o, e), n * this.headWidthFactor)
		var s = n * this.neckWidthFactor
		var a = n * this.neckHeightFactor
		var l = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0)
		var u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, a, !0)
		var c = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !1)
		var p = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !0)
		var h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1)
		var d = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0)
		return [h, c, g, p, d]
	}),
	(xp.algorithm.getArrowBodyPoints = function (t, o, e, r) {
		for (
			var n = P.PlotUtils.wholeDistance(t),
				g = P.PlotUtils.getBaseLength(t),
				i = g * r,
				s = P.PlotUtils.distance(o, e),
				a = (i - s) / 2,
				l = 0,
				u = [],
				c = [],
				p = 1;
			p < t.length - 1;
			p++
		) {
			var h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2
			l += P.PlotUtils.distance(t[p - 1], t[p])
			var d = (i / 2 - (l / n) * a) / Math.sin(h)
			var f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0)
			var E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1)
			u.push(f), c.push(E)
		}
		return u.concat(c)
	}),
	(xp.algorithm.getTempPoint4 = function (t, o, e) {
		var r
		var n
		var g
		var i
		var s = P.PlotUtils.mid(t, o)
		var a = P.PlotUtils.distance(s, e)
		var l = P.PlotUtils.getAngleOfThreePoints(t, s, e)
		return (
			l < P.Constants.HALF_PI
				? ((n = a * Math.sin(l)),
				  (g = a * Math.cos(l)),
				  (i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1)),
				  (r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)))
				: l >= P.Constants.HALF_PI && l < Math.PI
				? ((n = a * Math.sin(Math.PI - l)),
				  (g = a * Math.cos(Math.PI - l)),
				  (i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1)),
				  (r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1)))
				: l >= Math.PI && l < 1.5 * Math.PI
				? ((n = a * Math.sin(l - Math.PI)),
				  (g = a * Math.cos(l - Math.PI)),
				  (i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0)),
				  (r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)))
				: ((n = a * Math.sin(2 * Math.PI - l)),
				  (g = a * Math.cos(2 * Math.PI - l)),
				  (i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0)),
				  (r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1))),
			r
		)
	}),
	(xp.algorithm.tailedAttackArrow = function (inputPoint) {
		inputPoint = xp.algorithm.dereplication(inputPoint)
		this.tailWidthFactor = tailedAttackArrowDefualParam.tailWidthFactor
		this.swallowTailFactor = tailedAttackArrowDefualParam.swallowTailFactor
		this.swallowTailPnt = tailedAttackArrowDefualParam.swallowTailPnt
		// 控制点
		var result = {
			controlPoint: null,
			polygonalPoint: null,
		}
		result.controlPoint = inputPoint
		var t = inputPoint.length
		if (!(t < 2)) {
			if (inputPoint.length == 2) {
				result.polygonalPoint = inputPoint
				return result
			}
			var o = inputPoint
			var e = o[0]
			var r = o[1]
			P.PlotUtils.isClockWise(o[0], o[1], o[2]) && ((e = o[1]), (r = o[0]))
			var n = P.PlotUtils.mid(e, r)
			var g = [n].concat(o.slice(2))
			var i = xp.algorithm.getAttackArrowHeadPoints(
				g,
				e,
				r,
				tailedAttackArrowDefualParam
			)
			var s = i[0]
			var a = i[4]
			var l = P.PlotUtils.distance(e, r)
			var u = P.PlotUtils.getBaseLength(g)
			var c = u * this.tailWidthFactor * this.swallowTailFactor
			this.swallowTailPnt = P.PlotUtils.getThirdPoint(g[1], g[0], 0, c, !0)
			var p = l / u
			var h = xp.algorithm.getAttackArrowBodyPoints(g, s, a, p)
			var t = h.length
			var d = [e].concat(h.slice(0, t / 2))
			d.push(s)
			var f = [r].concat(h.slice(t / 2, t))
			var newArray = []
			f.push(a),
				(d = P.PlotUtils.getQBSplinePoints(d)),
				(f = P.PlotUtils.getQBSplinePoints(f)),
				(newArray = xp.algorithm.array2Dto1D(
					d.concat(i, f.reverse(), [this.swallowTailPnt, d[0]])
				))
			result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
		}
		return result
	}),
	(xp.algorithm.getAttackArrowHeadPoints = function (t, o, e, defaultParam) {
		this.headHeightFactor = defaultParam.headHeightFactor
		this.headTailFactor = defaultParam.headTailFactor
		this.headWidthFactor = defaultParam.headWidthFactor
		this.neckWidthFactor = defaultParam.neckWidthFactor
		this.neckHeightFactor = defaultParam.neckHeightFactor
		var r = P.PlotUtils.getBaseLength(t)
		var n = r * this.headHeightFactor
		var g = t[t.length - 1]
		r = P.PlotUtils.distance(g, t[t.length - 2])
		var i = P.PlotUtils.distance(o, e)
		n > i * this.headTailFactor && (n = i * this.headTailFactor)
		var s = n * this.headWidthFactor
		var a = n * this.neckWidthFactor
		n = n > r ? r : n
		var l = n * this.neckHeightFactor
		var u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0)
		var c = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, l, !0)
		var p = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1)
		var h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0)
		var d = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !1)
		var f = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !0)
		return [d, p, g, h, f]
	}),
	(xp.algorithm.getAttackArrowBodyPoints = function (t, o, e, r) {
		for (
			var n = P.PlotUtils.wholeDistance(t),
				g = P.PlotUtils.getBaseLength(t),
				i = g * r,
				s = P.PlotUtils.distance(o, e),
				a = (i - s) / 2,
				l = 0,
				u = [],
				c = [],
				p = 1;
			p < t.length - 1;
			p++
		) {
			var h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2
			l += P.PlotUtils.distance(t[p - 1], t[p])
			var d = (i / 2 - (l / n) * a) / Math.sin(h)
			var f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0)
			var E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1)
			u.push(f), c.push(E)
		}
		return u.concat(c)
	}),
	(xp.algorithm.dereplication = function (array) {
		var last = array[array.length - 1]
		var change = false
		var newArray = []
		newArray = array.filter(function (i) {
			if (i[0] != last[0] && i[1] != last[1]) {
				return i
			}
			change = true
		})
		if (change) newArray.push(last)
		return newArray
	}),
	(xp.algorithm.fineArrow = function (tailPoint, headerPoint, width) {
		if (tailPoint.length < 2 || headerPoint.length < 2) return
		// 画箭头的函数
		const tailWidthFactor = fineArrowDefualParam.tailWidthFactor * width
		const neckWidthFactor = fineArrowDefualParam.neckWidthFactor * width
		const headWidthFactor = fineArrowDefualParam.headWidthFactor * width
		const headAngle = fineArrowDefualParam.headAngle
		const neckAngle = fineArrowDefualParam.neckAngle
		var o = []
		o[0] = tailPoint
		o[1] = headerPoint
		const e = o[0]
		const r = o[1]
		const n = P.PlotUtils.getBaseLength(o)
		const g = n * tailWidthFactor
		// 尾部宽度因子
		const i = n * neckWidthFactor
		// 脖子宽度银子
		const s = n * headWidthFactor
		// 头部宽度因子
		const a = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !0)
		const l = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !1)
		const u = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !1)
		const c = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !0)
		const p = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !1)
		const h = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !0)
		const d = []
		d.push(
			a[0],
			a[1],
			p[0],
			p[1],
			u[0],
			u[1],
			r[0],
			r[1],
			c[0],
			c[1],
			h[0],
			h[1],
			l[0],
			l[1],
			e[0],
			e[1]
		)
		return Cartesian3.fromDegreesArray(d)
	})
