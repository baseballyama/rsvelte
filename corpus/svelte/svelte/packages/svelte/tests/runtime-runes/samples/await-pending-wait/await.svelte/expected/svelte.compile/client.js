import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Await($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => $$props.promise,
		($$anchor) => {
			var text_1 = $.text('pending');

			$.append($$anchor, text_1);
		},
		($$anchor, value) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, `then ${$.get(value) ?? ''}`));
			$.append($$anchor, text);
		}
	);

	$.append($$anchor, fragment);
}