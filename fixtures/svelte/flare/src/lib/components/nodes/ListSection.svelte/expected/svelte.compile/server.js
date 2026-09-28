import * as $ from 'svelte/internal/server';

export default function ListSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { props } = $$props;

		$$renderer.push(`<h3 class="px-4 pt-2.5 pb-1 text-xs font-semibold text-gray-500 uppercase">${$.escape(props.title)}</h3>`);
	});
}