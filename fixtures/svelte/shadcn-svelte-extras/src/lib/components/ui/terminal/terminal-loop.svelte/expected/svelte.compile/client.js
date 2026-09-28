import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { useTerminalLoop } from './terminal.svelte.js';

export default function Terminal_loop($$anchor, $$props) {
	$.push($$props, true);

	let delay = $.prop($$props, 'delay', 3, 500);
	let loopIndex = $.state(0);
	let loopDelayTimeout = $.state(void 0);

	const onComplete = () => {
		$.set(loopDelayTimeout, setTimeout(() => $.update(loopIndex), delay()), true);
	};

	useTerminalLoop({ onComplete });
	onDestroy(() => clearTimeout($.get(loopDelayTimeout)));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => $.get(loopIndex), ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}