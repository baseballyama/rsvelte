import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { anchor } from '$actions/anchor';

var root = $.from_html(`<div class="dropdown-menu svelte-hx6dpd"><button class="dropdown-button button-reset svelte-hx6dpd"><!></button> <div popover="" class="dropdown-links svelte-hx6dpd"><!></div></div>`);

export default function DropdownMenu($$anchor, $$props) {
	var // ? What is this
	// A popover based drop down menu. Less specific than the Select Menu
	// This uses slots instead of props
	div = root();

	var button_1 = $.child(div);
	var node = $.child(button_1);

	$.snippet(node, () => $$props.button);
	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => anchor?.($$node, $$action_arg), () => ({ id: $$props.popover_id, position: ['BOTTOM', 'RIGHT'] }));

	var div_1 = $.sibling(button_1, 2);
	var node_1 = $.child(div_1);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button_1, 'popovertarget', $$props.popover_id);
		$.set_attribute(div_1, 'id', $$props.popover_id);
	});

	$.append($$anchor, div);
}