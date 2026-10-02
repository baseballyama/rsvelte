import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Declaration_tag_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => boxes, $.index, ($$anchor, box) => {
		const area = box.width * box.height;
		let label = `${area} square pixels`;
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `${format(doubled) ?? ''} (${label})`));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}