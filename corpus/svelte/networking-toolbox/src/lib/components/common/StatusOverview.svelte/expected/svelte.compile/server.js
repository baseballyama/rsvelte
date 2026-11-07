import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

export default function StatusOverview($$renderer, $$props) {
	let { items } = $$props;

	$$renderer.push(`<div class="status-overview"><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<div${$.attr_class(`status-item ${$.stringify(item.status || '')}`, 'svelte-1mctc6b')}>`);
		Icon($$renderer, { name: item.icon, size: 'sm' });
		$$renderer.push(`<!----> <div><strong>${$.escape(item.value)}</strong> <div class="status-text svelte-1mctc6b">${$.escape(item.label)}</div></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}