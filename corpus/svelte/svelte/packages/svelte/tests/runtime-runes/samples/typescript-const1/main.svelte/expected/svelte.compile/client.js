import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p></p>`, 1);

export default function Main($$anchor) {
	const boxes = [{ width: 10, height: 10 }, { width: 20, height: 20 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => boxes, $.index, ($$anchor, box) => {
		const area = $.derived(() => $.get(box).width * $.get(box).height);
		const name = $.derived(() => "{}");
		var fragment_1 = root();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p);
		var p_1 = $.sibling(p, 2);

		p_1.textContent = $.get(name);
		$.template_effect(() => $.set_text(text, `${$.get(box).width ?? ''} * ${$.get(box).height ?? ''} = ${$.get(area) ?? ''}`));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}