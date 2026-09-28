import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTabs } from './context.ts';

var root = $.from_html(`<button type="button" role="tab"><!></button>`);

export default function TabsTrigger($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const ctx = getTabs();
	const active = $.derived(() => ctx.value === $$props.value);
	var button = root();
	var node = $.child(button);

	$.snippet(node, () => $$props.children);
	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-selected', $.get(active));
		$.set_attribute(button, 'tabindex', $.get(active) ? 0 : -1);
		$.set_class(button, 1, `tabs-trigger ${$.get(active) ? 'active' : 'inactive'} ${className() ?? ''}`, 'svelte-19ti9wg');
	});

	$.delegated('click', button, () => ctx.setValue($$props.value));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);