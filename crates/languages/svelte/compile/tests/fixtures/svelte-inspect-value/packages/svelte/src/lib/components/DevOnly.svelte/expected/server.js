import * as $ from 'svelte/internal/server';
import { DEV } from 'esm-env';

export default function DevOnly($$renderer, $$props) {
	const { children } = $$props;

	if (DEV && children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}