import * as $ from 'svelte/internal/server';

export default function Spread_scoped($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	let open = false;
	$$renderer.push(`<p${$.attributes({ ...props }, 'svelte-1py6098')}>scoped</p> <p${$.attributes({ ...props, class: 'lead' }, 'svelte-1py6098')}>scoped with class</p> <p${$.attributes({ ...props }, 'svelte-1py6098', { open })}>scoped with directive</p> <em${$.attributes({ ...props }, 'svelte-1py6098')}>unscoped</em> <button type="button">toggle</button>`);
}
