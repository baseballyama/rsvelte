import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <div></div>`, 1);

export default function Input($$anchor) {
	let boxes = [{ width: 3, height: 4 }, { width: 5, height: 7 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => boxes, $.index, ($$anchor, box) => {
		const area = $.get(box).width * $.get(box).height;
		let label = `${area} square pixels`;
		const doubled = area * 2;
		var fragment_1 = root();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p);
		var div = $.sibling(p, 2);

		{
			const area = 'nested';

			div.textContent = 'nested';
		}

		$.template_effect(() => $.set_text(text, `${doubled} ${label}`));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}