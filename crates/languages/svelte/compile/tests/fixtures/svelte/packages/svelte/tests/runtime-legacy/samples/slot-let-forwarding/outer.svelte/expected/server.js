import * as $ from 'svelte/internal/server';
import Inner from './inner.svelte';

export default function Outer($$renderer, $$props) {
	Inner($$renderer, {
		$$slots: {
			x: ($$renderer, { foo }) => {
				$$renderer.push(`<!--[-->`);

				$.slot($$renderer, $$props, 'x', { foo }, () => {
					$$renderer.push(`${$.escape(foo)}`);
				});

				$$renderer.push(`<!--]-->`);
			}
		}
	});
}