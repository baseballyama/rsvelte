import * as $ from 'svelte/internal/server';
import { anchor } from '$actions/anchor';

export default function DropdownMenu($$renderer, $$props) {
	// ? What is this
	// A popover based drop down menu. Less specific than the Select Menu
	// This uses slots instead of props
	let { children, button, popover_id } = $$props;

	$$renderer.push(`<div class="dropdown-menu svelte-hx6dpd"><button${$.attr('popovertarget', popover_id)} class="dropdown-button button-reset svelte-hx6dpd">`);
	button($$renderer);
	$$renderer.push(`<!----></button> <div popover=""${$.attr('id', popover_id)} class="dropdown-links svelte-hx6dpd">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}