import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDemoRefresh } from './demo.svelte.js';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';
import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<button><!></button>`);

export default function Demo_control_refresh($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const refreshState = useDemoRefresh();
	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			type: 'button',
			'aria-label': 'Refresh',
			class: $0,
			onclick: refreshState.refresh,
			...rest
		}),
		[() => cn(controlVariants(), $$props.class)]
	);

	var node = $.child(button);

	RotateCcwIcon(node, {});
	$.reset(button);
	$.bind_this(button, ($$value) => ref($$value), () => ref());
	$.append($$anchor, button);
	$.pop();
}