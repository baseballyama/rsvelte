import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Declaration_tag_input($$anchor) {
	const boxes = [{ width: 10, height: 20 }, { width: 5, height: 5 }];

	function format(value) {
		return `${value} square pixels`;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => boxes, $.index, ($$anchor, box) => {
		const area = $.get(box).width * $.get(box).height;
		let label = `${area} square pixels`;
		var p = root();
		var text = $.only_child(p);

		$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} (${label})`), [() => format(area)]);
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}