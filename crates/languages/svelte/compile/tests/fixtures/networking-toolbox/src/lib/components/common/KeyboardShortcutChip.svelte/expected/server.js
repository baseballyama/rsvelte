import * as $ from 'svelte/internal/server';
import { formatShortcut } from '$lib/utils/keyboard';

export default function KeyboardShortcutChip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, shortcut, onclick } = $$props;
		const formattedShortcut = $.derived(() => formatShortcut(shortcut));

		$$renderer.push(`<button class="shortcut-chip svelte-130xdyn"${$.attr('aria-label', `${$.stringify(label)} - ${$.stringify(formattedShortcut())}`)}><span class="chip-label svelte-130xdyn">${$.escape(label)}</span> <span class="chip-shortcut svelte-130xdyn">${$.escape(formattedShortcut())}</span></button>`);
	});
}