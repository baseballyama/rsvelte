import * as $ from 'svelte/internal/server';
import PopperLayerInner from "./popper-layer-inner.svelte";

export default function Popper_layer($$renderer, $$props) {
	let {
		popper,
		open,
		onEscapeKeydown,
		escapeKeydownBehavior,
		preventOverflowTextSelection,
		id,
		onPointerDown,
		onPointerUp,
		side,
		sideOffset,
		align,
		alignOffset,
		arrowPadding,
		avoidCollisions,
		collisionBoundary,
		collisionPadding,
		sticky,
		hideWhenDetached,
		updatePositionStrategy,
		strategy,
		dir,
		preventScroll,
		wrapperId,
		style,
		onPlaced,
		onInteractOutside,
		onCloseAutoFocus,
		onOpenAutoFocus,
		onFocusOutside,
		interactOutsideBehavior = "close",
		loop,
		trapFocus = true,
		isValidEvent = () => false,
		customAnchor = null,
		isStatic = false,
		ref,
		shouldRender,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (shouldRender) {
		$$renderer.push('<!--[0-->');

		PopperLayerInner($$renderer, $.spread_props([
			{
				popper,
				onEscapeKeydown,
				escapeKeydownBehavior,
				preventOverflowTextSelection,
				id,
				onPointerDown,
				onPointerUp,
				side,
				sideOffset,
				align,
				alignOffset,
				arrowPadding,
				avoidCollisions,
				collisionBoundary,
				collisionPadding,
				sticky,
				hideWhenDetached,
				updatePositionStrategy,
				strategy,
				dir,
				preventScroll,
				wrapperId,
				style,
				onPlaced,
				customAnchor,
				isStatic,
				enabled: open,
				onInteractOutside,
				onCloseAutoFocus,
				onOpenAutoFocus,
				interactOutsideBehavior,
				loop,
				trapFocus,
				isValidEvent,
				onFocusOutside,
				forceMount: false,
				ref
			},
			restProps
		]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}