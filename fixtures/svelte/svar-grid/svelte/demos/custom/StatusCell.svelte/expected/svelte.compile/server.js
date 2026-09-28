import * as $ from 'svelte/internal/server';

export default function StatusCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;
		let status = $.derived(() => row.checked ? "active" : "non-active");

		$$renderer.push(`<div class="container svelte-wpn3rp"><div${$.attr_class(`status ${status()}`, 'svelte-wpn3rp')}><div class="dot svelte-wpn3rp"></div> ${$.escape(status())}</div></div>`);
	});
}