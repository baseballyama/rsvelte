import * as $ from 'svelte/internal/server';

export default function Mobile_menu_icon($$renderer, $$props) {
	let { open } = $$props;

	$$renderer.push(`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="[&amp;_line]:stroke-foreground [&amp;_line]:stroke-2 [&amp;_line]:transition-all [&amp;_line]:duration-150 [&amp;_line]:ease-[cubic-bezier(0.4,0,0.2,1)]" stroke-linecap="round"><line class="origin-center data-[open=true]:translate-y-[4px] data-[open=true]:rotate-45"${$.attr('data-open', open)} x1="3" y1="6" x2="21" y2="6"></line><line class="origin-left data-[open=true]:-translate-x-2 data-[open=true]:opacity-0"${$.attr('data-open', open)} x1="3" y1="12" x2="12" y2="12"></line><line class="origin-right data-[open=true]:translate-x-2 data-[open=true]:opacity-0"${$.attr('data-open', open)} x1="12" y1="12" x2="21" y2="12"></line><line class="origin-center data-[open=true]:-translate-y-[4.5px] data-[open=true]:-rotate-45"${$.attr('data-open', open)} x1="3" y1="18" x2="21" y2="18"></line></svg>`);
}