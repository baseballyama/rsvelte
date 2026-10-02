import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { onDestroy } from 'svelte';
import { useAnimation } from './terminal.svelte.js';
import { fly } from 'svelte/transition';
import { box } from 'svelte-toolbelt';

export default function Terminal_animated_span($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, delay = 0, class: className } = $$props;
		let playAnimation = false;
		let animationSpeed = 1;
		let completeTimeout = void 0;

		const play = (speed) => {
			playAnimation = true;
			animationSpeed = speed;
			completeTimeout = setTimeout(() => animation.onComplete?.(), duration());
		};

		const duration = $.derived(() => 300 / animationSpeed);
		const animation = useAnimation({ delay: box.with(() => delay), play });

		onDestroy(() => {
			animation.dispose();
			clearTimeout(completeTimeout);
		});

		if (playAnimation) {
			$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(cn('block', className)))}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}