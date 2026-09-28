import * as $ from 'svelte/internal/server';
import Edge from '$lib/components/generator/Edges/EdgeOption.svelte';

export default function Edges($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mode = 'radius', name, value = void 0, items = [] } = $$props;

		function setValue(v) {
			value = v;
		}

		$$renderer.push(`<div><input${$.attr('name', name)} type="hidden"/> <div class="grid gap-4"${$.attr_style(`grid-template-columns: repeat(${$.stringify(items.length)}, minmax(0, 1fr));`)}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let itemValue = each_array[$$index];

			Edge($$renderer, { value: itemValue, active: value, onselect: setValue, mode });
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { value });
	});
}