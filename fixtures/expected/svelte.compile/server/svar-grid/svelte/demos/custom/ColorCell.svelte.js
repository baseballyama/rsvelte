import * as $ from 'svelte/internal/server';

export default function ColorCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;
		const value = $.derived(() => row[column.id]);

		if (value()) {
			$$renderer.push(`<!--[0--><div class="color_block svelte-1wiuuwy"${$.attr_style(`background-color:${$.stringify(value())}`)}><span class="svelte-1wiuuwy">${$.escape(value())}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}