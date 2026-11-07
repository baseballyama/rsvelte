import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		const x = $.derived(() => item.value);
		const y = $.derived(() => a = item.n);
		const z = $.derived(() => ({ a: item.a }));

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `${$.get(x) ?? ''}${$.get(y) ?? ''}${$.get(z).a ?? ''}`));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}