import * as $ from 'svelte/internal/server';
import XIcon from '@lucide/svelte/icons/x';

export default function Tags_input_tag($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, disabled, onDelete, active } = $$props;

		$$renderer.push(`<div class="bg-secondary ring-offset-background hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-ring flex place-items-center gap-2 rounded-md px-2 py-0.5 transition-all hover:cursor-default aria-selected:ring-2 aria-selected:ring-offset-2"${$.attr('aria-selected', active)}><span>${$.escape(value)}</span> <button type="button"${$.attr('disabled', disabled, true)}>`);
		XIcon($$renderer, { class: 'size-4' });
		$$renderer.push(`<!----></button></div>`);
	});
}