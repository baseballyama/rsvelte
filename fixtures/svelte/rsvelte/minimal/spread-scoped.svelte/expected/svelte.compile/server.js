import * as $ from 'svelte/internal/server';

export default function Spread_scoped($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	let open = false;

	$$renderer.push(`<p${$.attributes({ ...props }, 'svelte-rtloaa')}>scoped</p> <p${$.attributes({ ...props, class: 'lead' }, 'svelte-rtloaa')}>scoped with class</p> <p${$.attributes({ ...props }, 'svelte-rtloaa', { open })}>scoped with directive</p> <em${$.attributes({ ...props }, 'svelte-rtloaa')}>unscoped</em> <button type="button">toggle</button>`);
}