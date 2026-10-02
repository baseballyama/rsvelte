import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <br/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let i = 'i';
	let k = writable('k');
	let l = 'l';
	let n = writable('n');
	let a = 'a';
	let c = writable('c');
	let d = 'd';
	let f = writable('f');

	function update() {
		i = 'ii';
		k = writable('kk');
		l = 'll';
		n = writable('nn');
		a = 'aa';
		c = writable('cc');
		d = 'dd';
		f = writable('ff');
	}

	var $$exports = { update };
	var fragment = root();
	var node = $.first_child(fragment);

	A(node, {});

	var node_1 = $.sibling(node, 4);

	A(node_1, {
		get i() {
			return i;
		},

		get k() {
			return k;
		},

		get l() {
			return l;
		},

		get n() {
			return n;
		},

		get a() {
			return a;
		},

		get c() {
			return c;
		},

		get d() {
			return d;
		},

		get f() {
			return f;
		}
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}