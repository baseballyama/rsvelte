import * as $ from 'svelte/internal/server';
import rotate from '../../transition/rotate.js';
import { useOptions } from '../../options.svelte.js';

export default function PanelValueIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { add = true } = $$props;
		const options = useOptions();

		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="2"></rect><path d="M9 3v18"></path>`);

		if (add) {
			$$renderer.push(`<!--[0--><path d="M 15.5 9 l 0 6" style="transform-box: fill-box" transform-origin="center"></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><path d="M 12.5 12 l 6 0"></path></g></svg>`);
	});
}