import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from "./A.svelte";
import { writable } from "svelte/store";

var root = $.from_html(`<!> <br/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = "x";
	let list_two_a = "list_two_a";
	let list_two_b = "list_two_b";
	let y = writable("y");
	let l = "l";
	let m = "m";
	let n = "n";
	let o = "o";
	let p = "p";
	let q = writable("q");
	let r = writable("r");
	let s = "s";

	function update() {
		x = "XX";
		list_two_a = "LIST_TWO_A";
		list_two_b = "LIST_TWO_B";
		y = writable("YY");
		l = "LL";
		m = "MM";
		n = "NN";
		o = "OO";
		p = "PP";
		q = writable("QQ");
		r = writable("RR");
		s = "SS";
	}

	var $$exports = { update };
	var fragment = root();
	var node = $.first_child(fragment);

	A(node, {});

	var node_1 = $.sibling(node, 4);

	A(node_1, {
		get x() {
			return x;
		},

		get list_two_a() {
			return list_two_a;
		},

		get list_two_b() {
			return list_two_b;
		},

		get y() {
			return y;
		},

		get l() {
			return l;
		},

		get m() {
			return m;
		},

		get n() {
			return n;
		},

		get o() {
			return o;
		},

		get p() {
			return p;
		},

		get q() {
			return q;
		},

		get r() {
			return r;
		},

		get s() {
			return s;
		}
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}