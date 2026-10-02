import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => thePromise,
		($$anchor) => {
			var text_2 = $.text('loading');

			$.append($$anchor, text_2);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [a, b] = $.get($$source);

				return { a, b };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var text = $.text('then');

			$.append($$anchor, text);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [c, [d, e]] = $.get($$source);

				return { c, d, e };
			});

			var c = $.derived(() => $.get($$value).c);
			var d = $.derived(() => $.get($$value).d);
			var e = $.derived(() => $.get($$value).e);
			var text_1 = $.text('catch');

			$.append($$anchor, text_1);
		}
	);

	$.append($$anchor, fragment);
}