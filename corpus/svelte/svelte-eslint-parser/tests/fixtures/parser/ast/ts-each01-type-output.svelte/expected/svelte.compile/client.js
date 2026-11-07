import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Ts_each01_type_output($$anchor) {
	const list = []; // list: number[]
	const items = []; // items: { id: number; name: string; }[]
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 17, () => list, $.index, ($$anchor, e) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(e)));
		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 19, () => items, (item) => item.id, ($$anchor, item, index) => {
		$.next();

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, `${$.get(index) ?? ''}${$.get(item).name ?? ''}`));
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}