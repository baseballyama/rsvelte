import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from "./sub.svelte";

var root = $.from_html(`<!> <button>Set all to undefined</button>`, 1);

export default function Main($$anchor) {
	let p0 = $.state(0);
	let p1 = $.state(0);
	let p2 = $.state(0);
	let p3 = $.state(0);
	let p4 = $.state(void 0);
	let p5 = $.state(void 0);
	let p6 = $.state(void 0);
	let p7 = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	Sub(node, {
		get p0() {
			return $.get(p0);
		},

		get p1() {
			return $.get(p1);
		},

		get p2() {
			return $.get(p2);
		},

		get p3() {
			return $.get(p3);
		},

		get p4() {
			return $.get(p4);
		},

		get p5() {
			return $.get(p5);
		},

		get p6() {
			return $.get(p6);
		},

		get p7() {
			return $.get(p7);
		}
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(p0, undefined);
		$.set(p1, undefined);
		$.set(p2, undefined);
		$.set(p3, undefined);
		$.set(p4, undefined);
		$.set(p5, undefined);
		$.set(p6, undefined);
		$.set(p7, undefined);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);