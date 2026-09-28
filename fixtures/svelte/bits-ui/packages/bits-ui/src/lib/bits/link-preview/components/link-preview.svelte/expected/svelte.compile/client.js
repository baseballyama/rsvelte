import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { LinkPreviewRootState } from "../link-preview.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

export default function Link_preview($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		open = $.prop($$props, 'open', 15, false),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop),
		openDelay = $.prop($$props, 'openDelay', 3, 700),
		closeDelay = $.prop($$props, 'closeDelay', 3, 300);

	LinkPreviewRootState.create({
		disabled: boxWith(() => disabled()),
		open: boxWith(() => open(), (v) => {
			open(v);
			onOpenChange()(v);
		}),
		openDelay: boxWith(() => openDelay()),
		closeDelay: boxWith(() => closeDelay()),
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FloatingLayer.Root, ($$anchor, FloatingLayer_Root) => {
		FloatingLayer_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}