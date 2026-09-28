import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import { useDemoFullscreen } from './demo.svelte.js';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<button><!></button>`);

export default function Demo_control_fullscreen($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const fullscreenState = useDemoFullscreen();
	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			type: 'button',
			'aria-label': 'View in fullscreen',
			class: $0,
			onclick: fullscreenState.fullscreen,
			...rest
		}),
		[() => cn(controlVariants(), $$props.class)]
	);

	var node = $.child(button);

	MaximizeIcon(node, {});
	$.reset(button);
	$.bind_this(button, ($$value) => ref($$value), () => ref());
	$.append($$anchor, button);
	$.pop();
}