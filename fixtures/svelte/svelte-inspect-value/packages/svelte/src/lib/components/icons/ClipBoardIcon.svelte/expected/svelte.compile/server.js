import * as $ from 'svelte/internal/server';
import { draw } from 'svelte/transition';
import { useOptions } from '../../options.svelte.js';

export default function ClipBoardIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { copied = false } = $$props;
		const options = useOptions();

		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>`);

		if (copied) {
			$$renderer.push(`<!--[0--><path d="m9 14l2 2l4-4"></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></g></svg>`);
	});
}