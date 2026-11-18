import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Imp from "./Imp.svelte";
var root = $.from_html(`<p> </p>`);
export default function Export_specifiers($$anchor, $$props) {
	$.push($$props, true);
	let p = $.prop($$props, "p", 7, 1), q = $.prop($$props, "q", 7);
	let a = 1;
	let s = $.state(0);
	let r = $.state(0);
	let d = $.derived(() => $.get(s) * 2);
	let l = 0;
	const c = 3;
	function f() {
		a = 0;
		$.set(s, 1);
		$.set(r, 2);
		l = 2;
		p(3);
		q(4);
		K = class {};
	}
	let K = class {};
	const z = 1;
	var $$exports = {
		get a() {
			return a;
		},
		set a($$value) {
			a = $$value;
		},
		get b() {
			return a;
		},
		set b($$value) {
			a = $$value;
		},
		get s() {
			return $.get(s);
		},
		set s($$value) {
			$.set(s, $.proxy($$value));
		},
		get r() {
			return $.get(r);
		},
		set r($$value) {
			$.set(r, $$value);
		},
		get d() {
			return $.get(d);
		},
		get lll() {
			return l;
		},
		set lll($$value) {
			l = $$value;
		},
		"c-d": c,
		f,
		get K() {
			return K;
		},
		set K($$value) {
			K = $$value;
		},
		Imp,
		get p() {
			return p();
		},
		set p($$value) {
			p($$value);
		},
		get q() {
			return q();
		},
		set q($$value) {
			q($$value);
		},
		z
	};
	var p_1 = root();
	var text = $.only_child(p_1);
	$.template_effect(() => $.set_text(text, `${$.get(s) ?? ""} ${l ?? ""} ${a ?? ""}`));
	$.append($$anchor, p_1);
	return $.pop($$exports);
}
