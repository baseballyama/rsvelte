import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { MenuMenuState, MenuRootState } from "../menu.svelte.js";
import { noop } from "$lib/internal/noop.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";

export default function Menu($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		dir = $.prop($$props, 'dir', 3, "ltr"),
		// debugMode = false,
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop),
		variant = $.prop($$props, '_internal_variant', 3, "dropdown-menu"),
		shouldSkipExitAnimation = $.prop($$props, '_internal_should_skip_exit_animation', 3, undefined);

	const root = MenuRootState.create({
		variant: boxWith(() => variant()),
		dir: boxWith(() => dir()),
		// debugMode: boxWith(() => debugMode),
		onClose: () => {
			open(false);
			onOpenChange()(false);
		},
		shouldSkipExitAnimation: () => shouldSkipExitAnimation()?.() ?? false
	});

	MenuMenuState.create(
		{
			open: boxWith(() => open(), (v) => {
				open(v);
				onOpenChange()(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
		},
		root
	);

	FloatingLayer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}