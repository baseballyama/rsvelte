import * as $ from 'svelte/internal/server';
import { openStackblitzProject } from '@/modules/stackblitz/stackblitz';

export default function Open_in_stackblitz($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const framework = $.derived(() => props.framework),
			files = $.derived(() => props.files),
			rest = $.derived(() => $.exclude_from_object(props, ['framework', 'files']));

		function openInStackblitz() {
			openStackblitzProject(framework(), files());
		}

		$$renderer.push(`<button${$.attributes({
			...rest(),
			type: 'button',
			class: `btn-icon preset-tonal hover:preset-tonal ${$.stringify(rest().class)}`,
			title: 'Open on Stackblitz',
			'aria-label': 'Open on Stackblitz'
		})}><svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 16 16"><path class="fill-current" d="m5 15l8-8H9l2-6l-8 8h4z"></path></svg></button>`);
	});
}