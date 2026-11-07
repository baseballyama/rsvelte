import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Declaration_tag_input($$anchor) {
	let boxes = [{ width: 10, height: 10 }, { width: 15, height: 15 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => boxes, $.index, ($$anchor, box) => {
		const area = $.get(box).width * $.get(box).height;

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `${$.get(box).width ?? ''} * ${$.get(box).height ?? ''} = ${area}`));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}