import * as $ from 'svelte/internal/server';

export default function StatusStub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<div${$.attr_class(`status ${$.stringify(data.type)}`, 'svelte-5yz92a')}><div class="status-wrapper svelte-5yz92a"><div class="dot svelte-5yz92a"></div> <span class="name svelte-5yz92a">${$.escape(data.label)}</span></div></div>`);
	});
}