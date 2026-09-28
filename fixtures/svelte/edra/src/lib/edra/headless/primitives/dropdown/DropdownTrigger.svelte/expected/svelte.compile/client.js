import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getDropdown } from './context.ts';

var root = $.from_html(`<button type="button" aria-haspopup="menu"><!></button>`);

export default function DropdownTrigger($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const ctx = getDropdown();
	let element = $.state(null);

	$.user_effect(() => {
		ctx.setTrigger($.get(element));
	});

	function handleKeydown(e) {
		if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			ctx.open = true;
		}
	}

	var button = root();
	var node = $.child(button);

	$.snippet(node, () => $$props.children);
	$.reset(button);
	$.bind_this(button, ($$value) => $.set(element, $$value), () => $.get(element));

	$.template_effect(() => {
		$.set_class(button, 1, `edra-btn edra-btn-ghost edra-btn-icon ${className() ?? ''}`);
		$.set_attribute(button, 'title', $$props.title);
		$.set_attribute(button, 'aria-expanded', ctx.open);
	});

	$.delegated('click', button, (e) => {
		e.stopPropagation();
		ctx.toggle();
	});

	$.delegated('keydown', button, handleKeydown);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click', 'keydown']);