import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div tabindex="-1" role="menuitem"><div><i class="wxi-eye"></i></div> <span> </span></div>`);

export default function HeaderMenuItem($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	let classes;
	var span = $.sibling(div_1, 2);
	var text = $.only_child(span, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'aria-label', $$props.item.hidden
			? `Show ${$$props.item.text} column`
			: `Hide ${$$props.item.text} column`);

		classes = $.set_class(div_1, 1, 'wx-icon svelte-1v2bw4o', null, classes, { 'wx-hidden': !!$$props.item.hidden });
		$.set_text(text, $$props.item.text);
	});

	$.append($$anchor, div);
	$.pop();
}