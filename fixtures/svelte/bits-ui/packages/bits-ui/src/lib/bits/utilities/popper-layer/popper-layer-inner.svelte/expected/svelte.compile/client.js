import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import ScrollLock from "../scroll-lock/scroll-lock.svelte";
import PopperContent from "./popper-content.svelte";
import EscapeLayer from "$lib/bits/utilities/escape-layer/escape-layer.svelte";
import DismissibleLayer from "$lib/bits/utilities/dismissible-layer/dismissible-layer.svelte";
import TextSelectionLayer from "$lib/bits/utilities/text-selection-layer/text-selection-layer.svelte";
import FocusScope from "$lib/bits/utilities/focus-scope/focus-scope.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'popper',
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
	'enabled',
	'ref',
	'tooltip',
	'contentPointerEvents'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Popper_layer_inner($$anchor, $$props) {
	$.push($$props, true);

	let interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "close"),
		trapFocus = $.prop($$props, 'trapFocus', 3, true),
		isValidEvent = $.prop($$props, 'isValidEvent', 3, () => false),
		customAnchor = $.prop($$props, 'customAnchor', 3, null),
		isStatic = $.prop($$props, 'isStatic', 3, false),
		tooltip = $.prop($$props, 'tooltip', 3, false),
		contentPointerEvents = $.prop($$props, 'contentPointerEvents', 3, "auto"),
		restProps = $.rest_props($$props, rest_excludes);

	const resolvedPreventScroll = $.derived(() => $$props.preventScroll ?? true);
	const effectiveStrategy = $.derived(() => $$props.strategy ?? ($.get(resolvedPreventScroll) ? "fixed" : "absolute"));

	{
		const content = ($$anchor, $$arg0) => {
			let floatingProps = () => ($$arg0?.()).props;
			let wrapperProps = () => ($$arg0?.()).wrapperProps;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					ScrollLock($$anchor, {
						get preventScroll() {
							return $.get(resolvedPreventScroll);
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					ScrollLock($$anchor, {
						get preventScroll() {
							return $.get(resolvedPreventScroll);
						}
					});
				};

				$.if(node, ($$render) => {
					if ($$props.forceMount && $$props.enabled) $$render(consequent); else if (!$$props.forceMount) $$render(consequent_1, 1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				const focusScope = ($$anchor, $$arg0) => {
					let focusScopeProps = () => ($$arg0?.()).props;

					EscapeLayer($$anchor, {
						get onEscapeKeydown() {
							return $$props.onEscapeKeydown;
						},

						get escapeKeydownBehavior() {
							return $$props.escapeKeydownBehavior;
						},

						get enabled() {
							return $$props.enabled;
						},

						get ref() {
							return $$props.ref;
						},

						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let dismissibleProps = () => ($$arg0?.()).props;

									TextSelectionLayer($$anchor, {
										get id() {
											return $$props.id;
										},

										get preventOverflowTextSelection() {
											return $$props.preventOverflowTextSelection;
										},

										get onPointerDown() {
											return $$props.onPointerDown;
										},

										get onPointerUp() {
											return $$props.onPointerUp;
										},

										get enabled() {
											return $$props.enabled;
										},

										get ref() {
											return $$props.ref;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_2 = $.first_child(fragment_7);

											{
												let $0 = $.derived(() => ({
													props: mergeProps(restProps, floatingProps(), dismissibleProps(), focusScopeProps(), { style: { pointerEvents: contentPointerEvents() } }),
													wrapperProps: wrapperProps()
												}));

												$.snippet(node_2, () => $$props.popper ?? $.noop, () => $.get($0));
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								};

								DismissibleLayer($$anchor, {
									get id() {
										return $$props.id;
									},

									get onInteractOutside() {
										return $$props.onInteractOutside;
									},

									get onFocusOutside() {
										return $$props.onFocusOutside;
									},

									get interactOutsideBehavior() {
										return interactOutsideBehavior();
									},

									get isValidEvent() {
										return isValidEvent();
									},

									get enabled() {
										return $$props.enabled;
									},

									get ref() {
										return $$props.ref;
									},
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				FocusScope(node_1, {
					get onOpenAutoFocus() {
						return $$props.onOpenAutoFocus;
					},

					get onCloseAutoFocus() {
						return $$props.onCloseAutoFocus;
					},

					get loop() {
						return $$props.loop;
					},

					get enabled() {
						return $$props.enabled;
					},

					get trapFocus() {
						return trapFocus();
					},

					get forceMount() {
						return $$props.forceMount;
					},

					get ref() {
						return $$props.ref;
					},
					focusScope,
					$$slots: { focusScope: true }
				});
			}

			$.append($$anchor, fragment_1);
		};

		PopperContent($$anchor, {
			get isStatic() {
				return isStatic();
			},

			get id() {
				return $$props.id;
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
				return $.get(effectiveStrategy);
			},

			get dir() {
				return $$props.dir;
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

			get enabled() {
				return $$props.enabled;
			},

			get tooltip() {
				return tooltip();
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}