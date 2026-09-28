import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>waiting for the promise to resolve...</p>`);
var root_2 = $.from_html(`<p>Something went wrong</p>`);
var root_3 = $.from_html(`<p>the promise resolved</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		},
		($$anchor, value) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `The value is ${$.get(value) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `Something went wrong: ${$.get(error).message ?? ''}`));
			$.append($$anchor, p_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => promise, null, void 0, ($$anchor, error) => {
		var p_3 = root();
		var text_2 = $.only_child(p_3);

		$.template_effect(() => $.set_text(text_2, `The error is ${$.get(error) ?? ''}`));
		$.append($$anchor, p_3);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => promise, null, ($$anchor, value) => {
		var p_4 = root();
		var text_3 = $.only_child(p_4);

		$.template_effect(() => $.set_text(text_3, `The value is ${$.get(value) ?? ''}`));
		$.append($$anchor, p_4);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => promise, null, void 0, ($$anchor) => {
		var p_5 = root_2();

		$.append($$anchor, p_5);
	});

	var node_4 = $.sibling(node_3, 2);

	$.await(
		node_4,
		() => promise,
		($$anchor) => {
			var p_8 = root_1();

			$.append($$anchor, p_8);
		},
		($$anchor) => {
			var p_6 = root_3();

			$.append($$anchor, p_6);
		},
		($$anchor, error) => {
			var p_7 = root();
			var text_4 = $.only_child(p_7);

			$.template_effect(() => $.set_text(text_4, `The error is ${$.get(error) ?? ''}`));
			$.append($$anchor, p_7);
		}
	);

	var node_5 = $.sibling(node_4, 2);

	$.await(
		node_5,
		() => promise,
		($$anchor) => {
			var p_10 = root_1();

			$.append($$anchor, p_10);
		},
		void 0,
		($$anchor) => {
			var p_9 = root_2();

			$.append($$anchor, p_9);
		}
	);

	$.append($$anchor, fragment);
}