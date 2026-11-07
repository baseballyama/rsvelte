import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		const _item = $.derived(() => item);

		const computed_const = $.derived(() => {
			return abc;
		});

		const computed_const_1 = $.derived(() => {
			const [e] = abc;

			return { e };
		});

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}