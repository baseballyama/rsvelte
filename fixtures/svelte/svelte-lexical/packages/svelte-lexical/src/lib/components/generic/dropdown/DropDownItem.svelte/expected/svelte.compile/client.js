import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getRegisterItemFunc } from './utils.js';

var root = $.from_html(`<button type="button"><!></button>`);

export default function DropDownItem($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, undefined),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, undefined);

	let ref = $.state(void 0);
	const registerItem = getRegisterItemFunc();

	if (registerItem === null) {
		throw new Error('DropDownItem must be used within a DropDown');
	}

	onMount(() => {
		registerItem($.get(ref));
	});

	var button = root();
	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.bind_this(button, ($$value) => $.set(ref, $$value), () => $.get(ref));

	$.template_effect(() => {
		$.set_class(button, 1, $.clsx($$props.class));
		$.set_attribute(button, 'title', title());
		$.set_attribute(button, 'aria-label', ariaLabel());
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);