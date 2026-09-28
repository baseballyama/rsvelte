import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 7);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, items, $.index, ($$anchor, item, i) => {
		var img = root();

		$.set_attribute(img, 'alt', `slider${i}`);
		$.bind_this(img, ($$value, i) => items()[i].img = $$value, (i) => items()?.[i]?.img, () => [i]);
		$.template_effect(() => $.set_attribute(img, 'src', $.get(item).src));
		$.append($$anchor, img);
	});

	$.append($$anchor, fragment);
	$.pop();
}