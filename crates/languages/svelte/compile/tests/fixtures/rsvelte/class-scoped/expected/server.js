import * as $ from 'svelte/internal/server';

export default function Class_scoped($$renderer) {
	let open = false;
	let kind = 'info';
	$$renderer.push(`<p${$.attr_class($.clsx(kind), 'svelte-sdhwnl')}>expression</p> <p class="note info svelte-sdhwnl">interpolated</p> <p${$.attr_class('svelte-sdhwnl', void 0, { 'open': open })}>directive only</p> <p${$.attr_class('static svelte-sdhwnl', void 0, { 'open': open })}>static and directive</p> <p${$.attr_class($.clsx({ open }), 'svelte-sdhwnl')}>object</p> <p class="fixed &amp; sure svelte-sdhwnl">literal</p> <span class="plain svelte-sdhwnl">static</span> <button>toggle</button>`);
}
