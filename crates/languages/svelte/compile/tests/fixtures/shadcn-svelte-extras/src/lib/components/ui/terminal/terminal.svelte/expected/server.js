import * as $ from 'svelte/internal/server';
import { Window } from '$lib/components/ui/window';
import { cn } from '$lib/utils.js';
import { useTerminalRoot } from './terminal.svelte.js';
import { onMount } from 'svelte';
import { box } from 'svelte-toolbelt';

export default function Terminal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			delay = 0,
			speed = 1,
			onComplete = () => {},
			children,
			class: className
		} = $$props;

		const terminal = useTerminalRoot({
			delay: box.with(() => delay),
			speed: box.with(() => speed),
			onComplete: box.with(() => onComplete)
		});

		onMount(() => {
			// we play here so that we don't play before it is visible (on the server)
			terminal.play();

			return () => {
				terminal.dispose();
			};
		});

		Window($$renderer, {
			class: cn('font-mono text-sm font-light', className),
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}