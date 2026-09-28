import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

var root = $.from_html(`<span>bye</span> <span>world</span>`, 1);
var root_1 = $.from_html(`<span slot="a">hello world</span>`);
var root_2 = $.from_html(`<span>bye world</span>`);
var root_3 = $.from_html(`<span slot="b">hello world</span>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a;
	let b;

	function getA() {
		return a.getData();
	}

	function getB() {
		return b.getData();
	}

	var $$exports = { getA, getB };
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.bind_this(
		A(node, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();

				$.next(2);
				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				a: ($$anchor, $$slotProps) => {
					var span = root_1();

					$.append($$anchor, span);
				}
			}
		}),
		($$value) => a = $$value,
		() => a
	);

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		A(node_1, {
			children: ($$anchor, $$slotProps) => {
				var span_1 = root_2();

				$.append($$anchor, span_1);
			},

			$$slots: {
				default: true,
				a: ($$anchor, $$slotProps) => {
					var span_2 = root_1();

					$.append($$anchor, span_2);
				},

				b: ($$anchor, $$slotProps) => {
					var span_3 = root_3();

					$.append($$anchor, span_3);
				}
			}
		}),
		($$value) => b = $$value,
		() => b
	);

	$.append($$anchor, fragment);

	return $.pop($$exports);
}