import * as $ from 'svelte/internal/server';
import { getAllContexts, mount, unmount } from 'svelte';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const context = getAllContexts();

		const children = $.derived(() => props.children),
			disabled = $.derived(() => $.fallback(props.disabled, false)),
			target = $.derived(() => $.fallback(props.target, () => typeof window === 'undefined' ? undefined : document.body, true));

		if (disabled() || !target()) {
			$$renderer.push('<!--[0-->');
			children()($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}