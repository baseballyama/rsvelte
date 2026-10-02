import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-label="color picker"><!></div>`);

export default function A11yHorizontalWrapper($$anchor, $$props) {
	$.push($$props, true);

	/** DOM element of the Color Picker popup wrapper */
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
		classes = $.set_class(div, 1, 'wrapper svelte-h6u3ly', null, classes, { 'is-open': $$props.isOpen });
		$.set_attribute(div, 'role', $$props.isDialog ? 'dialog' : undefined);
	});

	$.append($$anchor, div);
	$.pop();
}