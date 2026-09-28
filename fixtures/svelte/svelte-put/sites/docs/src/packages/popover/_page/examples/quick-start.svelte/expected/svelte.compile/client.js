import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from '@svelte-put/popover';

var root = $.from_html(`<button>Open me Popover</button> <div><p>Popover content. Click backdrop to dismiss</p></div>`, 1);

export default function Quick_start($$anchor, $$props) {
	$.push($$props, true);

	const popover = new Popover();
	var fragment = root();
	var button = $.first_child(fragment);

	$.attribute_effect(button, () => ({ class: 'c-btn', ...popover.control.attributes }));
	$.action(button, ($$node) => popover.control.actions?.($$node));

	var div = $.sibling(button, 2);

	$.attribute_effect(div, () => ({
		class: 'fixed inset-0 m-auto p-6 backdrop:bg-black backdrop:opacity-50',
		...popover.target.attributes
	}));

	$.action(div, ($$node) => popover.target.actions?.($$node));
	$.append($$anchor, fragment);
	$.pop();
}