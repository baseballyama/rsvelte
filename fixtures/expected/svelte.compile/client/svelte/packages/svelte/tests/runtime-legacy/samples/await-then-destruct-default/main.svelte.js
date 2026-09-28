import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let object = Promise.resolve({ b: 2, c: 3 });
	let array = Promise.resolve([1, 2]);
	let objectReject = Promise.reject({ b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2]);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.await(node, () => object, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { a = 3, b = 4, c } = $.get($$source);

			return { a, b, c };
		});

		var a = $.derived(() => $.get($$value).a);
		var b = $.derived(() => $.get($$value).b);
		var c = $.derived(() => $.get($$value).c);
		var fragment_1 = root();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p);
		var p_1 = $.sibling(p, 2);
		var text_1 = $.only_child(p_1);
		var p_2 = $.sibling(p_1, 2);
		var text_2 = $.only_child(p_2);

		$.template_effect(() => {
			$.set_text(text, `a: ${$.get(a) ?? ''}`);
			$.set_text(text_1, `b: ${$.get(b) ?? ''}`);
			$.set_text(text_2, `c: ${$.get(c) ?? ''}`);
		});

		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => array, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [a, b, c = 3] = $.get($$source);

			return { a, b, c };
		});

		var a = $.derived(() => $.get($$value).a);
		var b = $.derived(() => $.get($$value).b);
		var c = $.derived(() => $.get($$value).c);
		var fragment_2 = root();
		var p_3 = $.first_child(fragment_2);
		var text_3 = $.only_child(p_3);
		var p_4 = $.sibling(p_3, 2);
		var text_4 = $.only_child(p_4);
		var p_5 = $.sibling(p_4, 2);
		var text_5 = $.only_child(p_5);

		$.template_effect(() => {
			$.set_text(text_3, `a: ${$.get(a) ?? ''}`);
			$.set_text(text_4, `b: ${$.get(b) ?? ''}`);
			$.set_text(text_5, `c: ${$.get(c) ?? ''}`);
		});

		$.append($$anchor, fragment_2);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => objectReject,
		null,
		($$anchor, value) => {
			var text_6 = $.text('resolved');

			$.append($$anchor, text_6);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { a = 3, b = 4, c } = $.get($$source);

				return { a, b, c };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var c = $.derived(() => $.get($$value).c);
			var fragment_3 = root();
			var p_6 = $.first_child(fragment_3);
			var text_7 = $.only_child(p_6);
			var p_7 = $.sibling(p_6, 2);
			var text_8 = $.only_child(p_7);
			var p_8 = $.sibling(p_7, 2);
			var text_9 = $.only_child(p_8);

			$.template_effect(() => {
				$.set_text(text_7, `a: ${$.get(a) ?? ''}`);
				$.set_text(text_8, `b: ${$.get(b) ?? ''}`);
				$.set_text(text_9, `c: ${$.get(c) ?? ''}`);
			});

			$.append($$anchor, fragment_3);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => arrayReject,
		null,
		($$anchor, value) => {
			var text_10 = $.text('resolved');

			$.append($$anchor, text_10);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [a, b, c = 3] = $.get($$source);

				return { a, b, c };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var c = $.derived(() => $.get($$value).c);
			var fragment_4 = root();
			var p_9 = $.first_child(fragment_4);
			var text_11 = $.only_child(p_9);
			var p_10 = $.sibling(p_9, 2);
			var text_12 = $.only_child(p_10);
			var p_11 = $.sibling(p_10, 2);
			var text_13 = $.only_child(p_11);

			$.template_effect(() => {
				$.set_text(text_11, `a: ${$.get(a) ?? ''}`);
				$.set_text(text_12, `b: ${$.get(b) ?? ''}`);
				$.set_text(text_13, `c: ${$.get(c) ?? ''}`);
			});

			$.append($$anchor, fragment_4);
		}
	);

	$.append($$anchor, fragment);
}