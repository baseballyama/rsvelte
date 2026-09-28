import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { onDestroy } from 'svelte';
import { useAnimation } from './terminal.svelte.js';
import { fly } from 'svelte/transition';
import { box } from 'svelte-toolbelt';

export default function Terminal_loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frames = ['◒', '◐', '◓', '◑'];

		let {
			delay = 0,
			loadingMessage,
			completeMessage,
			duration = 1000,
			class: className
		} = $$props;

		let playAnimation = false;
		let animationSpeed = 1;
		let frameIndex = 0;
		let complete = false;
		let interval = void 0;
		let timeout = void 0;

		const play = (speed) => {
			playAnimation = true;
			animationSpeed = speed;
			interval = setInterval(nextFrame, 75 / animationSpeed);

			timeout = setTimeout(
				() => {
					complete = true;
					animation.onComplete?.();
				},
				duration / animationSpeed
			);
		};

		const nextFrame = () => {
			if (frameIndex >= frames.length - 1) {
				frameIndex = 0;

				return;
			}

			frameIndex++;
		};

		const flyDuration = $.derived(() => 300 / animationSpeed);
		const animation = useAnimation({ delay: box.with(() => delay), play });

		onDestroy(() => {
			animation.dispose();
			clearInterval(interval);
			clearTimeout(timeout);
		});

		if (playAnimation && !complete) {
			$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(cn('block', className)))}><span class="text-cyan-400">${$.escape(frames[frameIndex])}</span> `);
			loadingMessage($$renderer);
			$$renderer.push(`<!----></span>`);
		} else if (playAnimation) {
			$$renderer.push(`<!--[1--><span${$.attr_class($.clsx(cn('block', className)))} data-completed="">`);
			completeMessage($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}