import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getDropdown } from './context.ts';

var root = $.from_html(`<div role="menuitem" tabindex="0"><!></div>`);

export default function DropdownItem($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const ctx = getDropdown();

	function handleKeydown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$$props.onclick?.(new MouseEvent('click'));
			ctx.close();
		}
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `dropdown-item ${className() ?? ''}`, 'svelte-v96tkx'));

	$.delegated('click', div, (e) => {
		$$props.onclick?.(e);
		ctx.close();
	});

	$.delegated('keydown', div, handleKeydown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);