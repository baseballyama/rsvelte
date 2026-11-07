import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div>await</div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Await_with_same_id_input($$anchor) {
	let a;
	let b;
	let c;
	let d;
	let e;
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => a,
		($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		},
		($$anchor, a) => {
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, $.get(a).x));
			$.append($$anchor, div);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => b,
		($$anchor) => {
			var div_3 = root_1();

			$.append($$anchor, div_3);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { x: b = 42 } = $.get($$source);

				return { b };
			});

			var b = $.derived(() => $.get($$value).b);
			var div_2 = root();
			var text_1 = $.only_child(div_2, true);

			$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(b).toExponential()]);
			$.append($$anchor, div_2);
		}
	);

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => c,
		($$anchor) => {
			var div_5 = root_1();

			$.append($$anchor, div_5);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { ...c } = $.get($$source);

				return { c };
			});

			var c = $.derived(() => $.get($$value).c);
			var div_4 = root();
			var text_2 = $.only_child(div_4, true);

			$.template_effect(() => $.set_text(text_2, $.get(c).x));
			$.append($$anchor, div_4);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => d,
		($$anchor) => {
			var div_7 = root_1();

			$.append($$anchor, div_7);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [d] = $.get($$source);

				return { d };
			});

			var d = $.derived(() => $.get($$value).d);
			var div_6 = root();
			var text_3 = $.only_child(div_6, true);

			$.template_effect(($0) => $.set_text(text_3, $0), [() => $.get(d).toExponential()]);
			$.append($$anchor, div_6);
		}
	);

	var node_4 = $.sibling(node_3, 2);

	$.await(
		node_4,
		() => e,
		($$anchor) => {
			var div_9 = root_1();

			$.append($$anchor, div_9);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [...e] = $.get($$source);

				return { e };
			});

			var e = $.derived(() => $.get($$value).e);
			var div_8 = root();
			var text_4 = $.only_child(div_8, true);

			$.template_effect(($0) => $.set_text(text_4, $0), [() => $.get(e)[0].toExponential()]);
			$.append($$anchor, div_8);
		}
	);

	$.append($$anchor, fragment);
}