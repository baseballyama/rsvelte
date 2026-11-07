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
				var { result, error } = $.get($$source);

				return { result, error };
			});

			var result = $.derived(() => $.get($$value).result);
			var error = $.derived(() => $.get($$value).error);
			var text = $.text('then');

			$.append($$anchor, text);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { error: { message, code } } = $.get($$source);

				return { message, code };
			});

			var message = $.derived(() => $.get($$value).message);
			var code = $.derived(() => $.get($$value).code);
			var text_1 = $.text('catch');

			$.append($$anchor, text_1);
		}
	);

	$.append($$anchor, fragment);
}