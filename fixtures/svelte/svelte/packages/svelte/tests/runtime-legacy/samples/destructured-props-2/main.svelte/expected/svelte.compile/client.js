import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <br/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = 'x';
	let list_two_a = 'list_two_a';
	let list_two_b = 'list_two_b';
	let y = writable('y');
	let m = 'm';
	let n = 'n';
	let o = 'o';
	let p = 'p';
	let q = writable('q');

	function update() {
		x = 'XX';
		list_two_a = 'LIST_TWO_A';
		list_two_b = 'LIST_TWO_B';
		y = writable('YY');
		m = 'MM';
		n = 'NN';
		o = 'OO';
		p = 'PP';
		q = writable('QQ');
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
		}
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}