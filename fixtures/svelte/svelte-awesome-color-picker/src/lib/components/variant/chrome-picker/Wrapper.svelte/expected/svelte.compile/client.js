import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-label="color picker"><!></div>`);

export default function Wrapper($$anchor, $$props) {
	$.push($$props, true);

	/** DOM element of the wrapper element */
	/** indicator of the popup state */
	/** if set to true, the wrapper should have a dialog role and be absolute. It should be relative otherwise */
	/** children */
	let wrapper = $.prop($$props, 'wrapper', 15);

	var div = root();
	let classes;
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => wrapper($$value), () => wrapper());

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'wrapper svelte-1q15mvd', null, classes, { 'is-open': $$props.isOpen });
		$.set_attribute(div, 'role', $$props.isDialog ? 'dialog' : undefined);
	});

	$.append($$anchor, div);
	$.pop();
}