import * as $ from 'svelte/internal/server';
import EEE from './EEE.svelte';
import RRR from './RRR.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (("Eva").startsWith('E')) {
			$$renderer.push('<!--[0-->');
			EEE($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			RRR($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}