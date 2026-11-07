import * as $ from 'svelte/internal/server';
import Two from './Two.svelte';

export default function One($$renderer, $$props) {
	Two($$renderer, {
		$$slots: {
			b: ($$renderer) => {
				$$renderer.push(`<div slot="b"><div><!--[-->`);
				$.slot($$renderer, $$props, 'a', {}, null);
				$$renderer.push(`<!--]--></div></div>`);
			}
		}
	});
}