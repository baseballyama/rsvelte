import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p>`, 1);
var root_1 = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let object = Promise.resolve({ a: 1, b: 2, c: 3 });
	let array = Promise.resolve([1, 2, 3, 4, 5, 6]);
	let objectReject = Promise.reject({ a: 1, b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2, 3, 4, 5, 6]);
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(node, () => object, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { a, ...rest } = $.get($$source);

			return { a, rest };
		});

		var a = $.derived(() => $.get($$value).a);
		var rest = $.derived(() => $.get($$value).rest);
		var fragment_1 = root();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p);
		var p_1 = $.sibling(p, 2);
		var text_1 = $.only_child(p_1);

		$.template_effect(
			($0) => {
				$.set_text(text, `a: ${$.get(a) ?? ''}`);
				$.set_text(text_1, `rest: ${$0 ?? ''}`);
			},
			[() => JSON.stringify($.get(rest))]
		);

		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => array, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [a, b, ...rest] = $.get($$source);

			return { a, b, rest };
		});

		var a = $.derived(() => $.get($$value).a);
		var b = $.derived(() => $.get($$value).b);
		var rest = $.derived(() => $.get($$value).rest);
		var fragment_2 = root_1();
		var p_2 = $.first_child(fragment_2);
		var text_2 = $.only_child(p_2);
		var p_3 = $.sibling(p_2, 2);
		var text_3 = $.only_child(p_3);
		var p_4 = $.sibling(p_3, 2);
		var text_4 = $.only_child(p_4);

		$.template_effect(
			($0) => {
				$.set_text(text_2, `a: ${$.get(a) ?? ''}`);
				$.set_text(text_3, `b: ${$.get(b) ?? ''}`);
				$.set_text(text_4, `rest: ${$0 ?? ''}`);
			},
			[() => JSON.stringify($.get(rest))]
		);

		$.append($$anchor, fragment_2);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => objectReject,
		null,
		($$anchor, value) => {
			var text_5 = $.text('resolved');

			$.append($$anchor, text_5);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { a, ...rest } = $.get($$source);

				return { a, rest };
			});

			var a = $.derived(() => $.get($$value).a);
			var rest = $.derived(() => $.get($$value).rest);
			var fragment_3 = root();
			var p_5 = $.first_child(fragment_3);
			var text_6 = $.only_child(p_5);
			var p_6 = $.sibling(p_5, 2);
			var text_7 = $.only_child(p_6);

			$.template_effect(
				($0) => {
					$.set_text(text_6, `a: ${$.get(a) ?? ''}`);
					$.set_text(text_7, `rest: ${$0 ?? ''}`);
				},
				[() => JSON.stringify($.get(rest))]
			);

			$.append($$anchor, fragment_3);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => arrayReject,
		null,
		($$anchor, value) => {
			var text_8 = $.text('resolved');

			$.append($$anchor, text_8);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [a, b, ...rest] = $.get($$source);

				return { a, b, rest };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var rest = $.derived(() => $.get($$value).rest);
			var fragment_4 = root_1();
			var p_7 = $.first_child(fragment_4);
			var text_9 = $.only_child(p_7);
			var p_8 = $.sibling(p_7, 2);
			var text_10 = $.only_child(p_8);
			var p_9 = $.sibling(p_8, 2);
			var text_11 = $.only_child(p_9);

			$.template_effect(
				($0) => {
					$.set_text(text_9, `a: ${$.get(a) ?? ''}`);
					$.set_text(text_10, `b: ${$.get(b) ?? ''}`);
					$.set_text(text_11, `rest: ${$0 ?? ''}`);
				},
				[() => JSON.stringify($.get(rest))]
			);

			$.append($$anchor, fragment_4);
		}
	);

	$.append($$anchor, fragment);
}