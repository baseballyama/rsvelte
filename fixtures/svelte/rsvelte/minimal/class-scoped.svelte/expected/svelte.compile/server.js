import * as $ from 'svelte/internal/server';

export default function Class_scoped($$renderer) {
	let open = false;
	let kind = 'info';

	$$renderer.push(`<p${$.attr_class($.clsx(kind), 'svelte-8iuerb')}>expression</p> <p class="note info svelte-8iuerb">interpolated</p> <p${$.attr_class('svelte-8iuerb', void 0, { 'open': open })}>directive only</p> <p${$.attr_class('static svelte-8iuerb', void 0, { 'open': open })}>static and directive</p> <p${$.attr_class($.clsx({ open }), 'svelte-8iuerb')}>object</p> <p class="fixed &amp; sure svelte-8iuerb">literal</p> <span class="plain svelte-8iuerb">static</span> <button>toggle</button>`);
}