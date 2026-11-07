import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const boxes = [];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => boxes, $.index, ($$anchor, box) => {
		const area = $.derived(() => $.get(box).width * $.get(box).height);

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `${$.get(box).width ?? ''} * ${$.get(box).height ?? ''} = ${$.get(area) ?? ''}`));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}