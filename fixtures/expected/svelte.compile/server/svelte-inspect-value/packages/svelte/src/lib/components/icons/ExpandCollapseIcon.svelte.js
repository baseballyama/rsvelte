import * as $ from 'svelte/internal/server';
import { backIn, backOut } from 'svelte/easing';
import { useOptions } from '../../options.svelte.js';
import rotate from '../../transition/rotate.js';

export default function ExpandCollapseIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = useOptions();
		let { expand, setting } = $$props;

		$$renderer.push(`<svg viewBox="0 0 24 24" stroke-linecap="square" stroke-linejoin="round"><g fill="currentColor" stroke-width="2" stroke="currentColor">`);

		if (expand) {
			$$renderer.push(`<!--[0--><path d="M 10 11 l 0 6" style="transform-box: fill-box" transform-origin="center"></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><path${$.attr_class($.clsx(['minus', setting]), 'svelte-1wz86od')} d="M 7 14 l 6 0" style="transform-box: fill-box" transform-origin="center"></path><path fill="none" d="
        M 2, 20
        l 0 -12
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2
        h -12
        a 2 2 0 0 1 -2 -2
        z"></path><path fill="none" d="
        M 6, 6
        l 0 -2
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2"></path></g></svg>`);
	});
}