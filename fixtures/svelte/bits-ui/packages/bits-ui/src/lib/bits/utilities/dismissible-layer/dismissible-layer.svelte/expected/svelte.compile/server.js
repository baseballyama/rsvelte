import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { DismissibleLayerState } from "./use-dismissable-layer.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Dismissible_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			interactOutsideBehavior = "close",
			onInteractOutside = noop,
			onFocusOutside = noop,
			id,
			children,
			enabled,
			isValidEvent = () => false,
			ref
		} = $$props;

		const dismissibleLayerState = DismissibleLayerState.create({
			id: boxWith(() => id),
			interactOutsideBehavior: boxWith(() => interactOutsideBehavior),
			onInteractOutside: boxWith(() => onInteractOutside),
			enabled: boxWith(() => enabled),
			onFocusOutside: boxWith(() => onFocusOutside),
			isValidEvent: boxWith(() => isValidEvent),
			ref
		});

		children?.($$renderer, { props: dismissibleLayerState.props });
		$$renderer.push(`<!---->`);
	});
}