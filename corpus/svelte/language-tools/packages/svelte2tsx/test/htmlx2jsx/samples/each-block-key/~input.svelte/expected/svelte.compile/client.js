import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 18, () => items, (item) => item.id, ($$anchor, item, i) => {
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${item ?? ''}${$.get(i) ?? ''}`));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}