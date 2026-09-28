import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	const object = Promise.resolve({ 'prop-1': 1, 'prop2': 2, 'prop-3': 3, 'prop4': 4 });
	const objectReject = Promise.reject({ 'prop-5': 5, 'prop6': 6, 'prop-7': 7, 'prop8': 8 });
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.await(node, () => object, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { 'prop-1': prop1, 'prop4': fourthProp, ...rest } = $.get($$source);

			return { prop1, fourthProp, rest };
		});

		var prop1 = $.derived(() => $.get($$value).prop1);
		var fourthProp = $.derived(() => $.get($$value).fourthProp);
		var rest = $.derived(() => $.get($$value).rest);
		var fragment_1 = root();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p);
		var p_1 = $.sibling(p, 2);
		var text_1 = $.only_child(p_1);
		var p_2 = $.sibling(p_1, 2);
		var text_2 = $.only_child(p_2);

		$.template_effect(
			($0) => {
				$.set_text(text, `prop-1: ${$.get(prop1) ?? ''}`);
				$.set_text(text_1, `prop4: ${$.get(fourthProp) ?? ''}`);
				$.set_text(text_2, `rest: ${$0 ?? ''}`);
			},
			[() => JSON.stringify($.get(rest))]
		);

		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => objectReject,
		null,
		($$anchor, value) => {
			var text_3 = $.text('resolved');

			$.append($$anchor, text_3);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { 'prop-7': prop7, 'prop6': sixthProp, ...rest } = $.get($$source);

				return { prop7, sixthProp, rest };
			});

			var prop7 = $.derived(() => $.get($$value).prop7);
			var sixthProp = $.derived(() => $.get($$value).sixthProp);
			var rest = $.derived(() => $.get($$value).rest);
			var fragment_2 = root();
			var p_3 = $.first_child(fragment_2);
			var text_4 = $.only_child(p_3);
			var p_4 = $.sibling(p_3, 2);
			var text_5 = $.only_child(p_4);
			var p_5 = $.sibling(p_4, 2);
			var text_6 = $.only_child(p_5);

			$.template_effect(
				($0) => {
					$.set_text(text_4, `prop-7: ${$.get(prop7) ?? ''}`);
					$.set_text(text_5, `prop6: ${$.get(sixthProp) ?? ''}`);
					$.set_text(text_6, `rest: ${$0 ?? ''}`);
				},
				[() => JSON.stringify($.get(rest))]
			);

			$.append($$anchor, fragment_2);
		}
	);

	$.append($$anchor, fragment);
}