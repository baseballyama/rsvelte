import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PopperLayerInner from "./popper-layer-inner.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'popper',
	'open',
	'onEscapeKeydown',
	'escapeKeydownBehavior',
	'preventOverflowTextSelection',
	'id',
	'onPointerDown',
	'onPointerUp',
	'side',
	'sideOffset',
	'align',
	'alignOffset',
	'arrowPadding',
	'avoidCollisions',
	'collisionBoundary',
	'collisionPadding',
	'sticky',
	'hideWhenDetached',
	'updatePositionStrategy',
	'strategy',
	'dir',
	'preventScroll',
	'wrapperId',
	'style',
	'onPlaced',
	'onInteractOutside',
	'onCloseAutoFocus',
	'onOpenAutoFocus',
	'onFocusOutside',
	'interactOutsideBehavior',
	'loop',
	'trapFocus',
	'isValidEvent',
	'customAnchor',
	'isStatic',
	'ref',
	'shouldRender'
]);

export default function Popper_layer($$anchor, $$props) {
	let interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "close"),
		trapFocus = $.prop($$props, 'trapFocus', 3, true),
		isValidEvent = $.prop($$props, 'isValidEvent', 3, () => false),
		customAnchor = $.prop($$props, 'customAnchor', 3, null),
		isStatic = $.prop($$props, 'isStatic', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PopperLayerInner($$anchor, $.spread_props(
				{
					get popper() {
						return $$props.popper;
					},

					get onEscapeKeydown() {
						return $$props.onEscapeKeydown;
					},

					get escapeKeydownBehavior() {
						return $$props.escapeKeydownBehavior;
					},

					get preventOverflowTextSelection() {
						return $$props.preventOverflowTextSelection;
					},

					get id() {
						return $$props.id;
					},

					get onPointerDown() {
						return $$props.onPointerDown;
					},

					get onPointerUp() {
						return $$props.onPointerUp;
					},

					get side() {
						return $$props.side;
					},

					get sideOffset() {
						return $$props.sideOffset;
					},

					get align() {
						return $$props.align;
					},

					get alignOffset() {
						return $$props.alignOffset;
					},

					get arrowPadding() {
						return $$props.arrowPadding;
					},

					get avoidCollisions() {
						return $$props.avoidCollisions;
					},

					get collisionBoundary() {
						return $$props.collisionBoundary;
					},

					get collisionPadding() {
						return $$props.collisionPadding;
					},

					get sticky() {
						return $$props.sticky;
					},

					get hideWhenDetached() {
						return $$props.hideWhenDetached;
					},

					get updatePositionStrategy() {
						return $$props.updatePositionStrategy;
					},

					get strategy() {
						return $$props.strategy;
					},

					get dir() {
						return $$props.dir;
					},

					get preventScroll() {
						return $$props.preventScroll;
					},

					get wrapperId() {
						return $$props.wrapperId;
					},

					get style() {
						return $$props.style;
					},

					get onPlaced() {
						return $$props.onPlaced;
					},

					get customAnchor() {
						return customAnchor();
					},

					get isStatic() {
						return isStatic();
					},

					get enabled() {
						return $$props.open;
					},

					get onInteractOutside() {
						return $$props.onInteractOutside;
					},

					get onCloseAutoFocus() {
						return $$props.onCloseAutoFocus;
					},

					get onOpenAutoFocus() {
						return $$props.onOpenAutoFocus;
					},

					get interactOutsideBehavior() {
						return interactOutsideBehavior();
					},

					get loop() {
						return $$props.loop;
					},

					get trapFocus() {
						return trapFocus();
					},

					get isValidEvent() {
						return isValidEvent();
					},

					get onFocusOutside() {
						return $$props.onFocusOutside;
					},
					forceMount: false,
					get ref() {
						return $$props.ref;
					}
				},
				() => restProps
			));
		};

		$.if(node, ($$render) => {
			if ($$props.shouldRender) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}