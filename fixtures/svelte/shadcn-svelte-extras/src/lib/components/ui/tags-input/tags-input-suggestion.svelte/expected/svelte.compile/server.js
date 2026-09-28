import * as $ from 'svelte/internal/server';

export default function Tags_input_suggestion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, value, active, onSelect } = $$props;

		$$renderer.push(`<button${$.attr('id', id)} type="button" role="option"${$.attr('aria-selected', active)} class="hover:bg-accent aria-selected:bg-accent w-full cursor-default rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors select-none">${$.escape(value)}</button>`);
	});
}