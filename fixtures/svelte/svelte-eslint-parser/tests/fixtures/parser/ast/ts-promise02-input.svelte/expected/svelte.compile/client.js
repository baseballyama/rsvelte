import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p style="color: red"> </p>`);
var root_2 = $.from_html(`<p>...waiting</p>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Ts_promise02_input($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => Promise.resolve(1),
		($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		},
		($$anchor, number) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(error).message));
			$.append($$anchor, p_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => Promise.resolve(1),
		($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.await(
				node_2,
				() => Promise.resolve('str'),
				($$anchor) => {
					var p_7 = root_2();

					$.append($$anchor, p_7);
				},
				($$anchor, s) => {
					var p_5 = root();
					var text_4 = $.only_child(p_5);

					$.template_effect(() => $.set_text(text_4, `The string is ${$.get(s) ?? ''}`));
					$.append($$anchor, p_5);
				},
				($$anchor, error) => {
					var p_6 = root_1();
					var text_5 = $.only_child(p_6, true);

					$.template_effect(() => $.set_text(text_5, $.get(error).message));
					$.append($$anchor, p_6);
				}
			);

			$.append($$anchor, fragment_1);
		},
		($$anchor, number) => {
			var p_3 = root();
			var text_2 = $.only_child(p_3);

			$.template_effect(() => $.set_text(text_2, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p_3);
		},
		($$anchor, error) => {
			var p_4 = root_1();
			var text_3 = $.only_child(p_4, true);

			$.template_effect(() => $.set_text(text_3, $.get(error).message));
			$.append($$anchor, p_4);
		}
	);

	var node_3 = $.sibling(node_1, 2);

	$.await(
		node_3,
		() => Promise.resolve(true),
		($$anchor) => {
			var p_10 = root_2();

			$.append($$anchor, p_10);
		},
		($$anchor, b) => {
			var p_8 = root();
			var text_6 = $.only_child(p_8);

			$.template_effect(() => $.set_text(text_6, `The boolean is ${$.get(b) ?? ''}`));
			$.append($$anchor, p_8);
		},
		($$anchor, error) => {
			var p_9 = root_1();
			var text_7 = $.only_child(p_9, true);

			$.template_effect(() => $.set_text(text_7, $.get(error).message));
			$.append($$anchor, p_9);
		}
	);

	var node_4 = $.sibling(node_3, 2);

	$.await(
		node_4,
		() => Promise.resolve(1),
		($$anchor) => {
			var p_13 = root_2();

			$.append($$anchor, p_13);
		},
		($$anchor, number) => {
			var p_11 = root();
			var text_8 = $.only_child(p_11);

			$.template_effect(() => $.set_text(text_8, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p_11);
		},
		($$anchor, error) => {
			var p_12 = root_1();
			var text_9 = $.only_child(p_12, true);

			$.template_effect(() => $.set_text(text_9, $.get(error).message));
			$.append($$anchor, p_12);
		}
	);

	var node_5 = $.sibling(node_4, 2);

	$.await(
		node_5,
		() => Promise.resolve(1),
		($$anchor) => {
			var p_16 = root_2();

			$.append($$anchor, p_16);
		},
		($$anchor, number) => {
			var p_14 = root();
			var text_10 = $.only_child(p_14);

			$.template_effect(() => $.set_text(text_10, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p_14);
		},
		($$anchor, error) => {
			var p_15 = root_1();
			var text_11 = $.only_child(p_15, true);

			$.template_effect(() => $.set_text(text_11, $.get(error).message));
			$.append($$anchor, p_15);
		}
	);

	var node_6 = $.sibling(node_5, 2);

	$.await(
		node_6,
		() => Promise.resolve(1),
		($$anchor) => {
			var p_19 = root_2();

			$.append($$anchor, p_19);
		},
		($$anchor, number) => {
			var p_17 = root();
			var text_12 = $.only_child(p_17);

			$.template_effect(() => $.set_text(text_12, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p_17);
		},
		($$anchor, error) => {
			var p_18 = root_1();
			var text_13 = $.only_child(p_18, true);

			$.template_effect(() => $.set_text(text_13, $.get(error).message));
			$.append($$anchor, p_18);
		}
	);

	var node_7 = $.sibling(node_6, 2);

	$.await(
		node_7,
		() => Promise.resolve(1),
		($$anchor) => {
			var p_22 = root_2();

			$.append($$anchor, p_22);
		},
		($$anchor, number) => {
			var p_20 = root();
			var text_14 = $.only_child(p_20);

			$.template_effect(() => $.set_text(text_14, `The number is ${$.get(number) ?? ''}`));
			$.append($$anchor, p_20);
		},
		($$anchor, error) => {
			var p_21 = root_1();
			var text_15 = $.only_child(p_21, true);

			$.template_effect(() => $.set_text(text_15, $.get(error).message));
			$.append($$anchor, p_21);
		}
	);

	$.append($$anchor, fragment);
}