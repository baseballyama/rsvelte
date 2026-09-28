import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Window } from '$lib/components/ui/window';
import { cn } from '$lib/utils.js';
import { useTerminalRoot } from './terminal.svelte.js';
import { onMount } from 'svelte';
import { box } from 'svelte-toolbelt';

export default function Terminal($$anchor, $$props) {
	$.push($$props, true);

	let delay = $.prop($$props, 'delay', 3, 0),
		speed = $.prop($$props, 'speed', 3, 1),
		onComplete = $.prop($$props, 'onComplete', 3, () => {});

	const terminal = useTerminalRoot({
		delay: box.with(() => delay()),
		speed: box.with(() => speed()),
		onComplete: box.with(() => onComplete())
	});

	onMount(() => {
		// we play here so that we don't play before it is visible (on the server)
		terminal.play();

		return () => {
			terminal.dispose();
		};
	});

	{
		let $0 = $.derived(() => cn('font-mono text-sm font-light', $$props.class));

		Window($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}