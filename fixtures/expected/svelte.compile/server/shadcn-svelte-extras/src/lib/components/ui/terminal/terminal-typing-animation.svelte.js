import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { onDestroy } from 'svelte';
import { useAnimation } from './terminal.svelte.js';
import { typewriter } from '$lib/actions/typewriter.svelte';
import { box } from 'svelte-toolbelt';

export default function Terminal_typing_animation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, delay = 0, class: className } = $$props;
		let playAnimation = false;
		let animationSpeed = 1;

		const play = (speed) => {
			playAnimation = true;
			animationSpeed = speed;
		};

		const animation = useAnimation({ delay: box.with(() => delay), play });

		onDestroy(() => animation.dispose());

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