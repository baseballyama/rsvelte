import * as $ from 'svelte/internal/server';
import FileIcon from '@lucide/svelte/icons/file';
import { cn } from '$lib/utils.js';

export default function Tree_view_file($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			name,
			icon,
			type = 'button',
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<button${$.attributes({
			type,
			class: $.clsx(cn('flex place-items-center gap-1 pl-[3px]', className)),
			...rest
		})}>`);

		if (icon) {
			$$renderer.push('<!--[0-->');
			icon($$renderer, { name });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			FileIcon($$renderer, { class: 'size-4' });
		}

		$$renderer.push(`<!--]--> <span>${$.escape(name)}</span></button>`);
	});
}