import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'x', 'y', 'active']);

export default function ResizableLayerHandle($$anchor, $$props) {
	let active = $.prop($$props, 'active', 3, false),
		eventHandlers = $.rest_props($$props, rest_excludes);

	const render = ({ context }) => {
		context.fillStyle = active() ? '#111' : '#444';
		context.fillRect($$props.x - 6, $$props.y - 6, 12, 12);
	};

	Layer($$anchor, $.spread_props({ render }, () => eventHandlers));
}