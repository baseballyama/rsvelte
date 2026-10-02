import * as $ from 'svelte/internal/server';
import { getFlag } from './flags';

export default function Flag($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { country = null } = $$props;

		$$renderer.push(`<span class="bg-foreground/20 flex h-4 w-6 shrink-0 overflow-clip rounded-sm [&amp;>svg]:h-4! [&amp;>svg]:w-6!">`);

		$.await($$renderer, getFlag(country), () => {}, (flag) => {
			if (flag) {
				$$renderer.push(`<!--[0-->${$.html(flag)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]--></span>`);
	});
}