import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CONTEXT_MENU_TRIGGER_ATTR, MenuContentState } from "$lib/bits/menu/menu.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { noop } from "$lib/internal/noop.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'child',
	'children',
	'ref',
	'loop',
	'onInteractOutside',
	'onCloseAutoFocus',
	'preventScroll',
	'onEscapeKeydown',
	'forceMount',
	'style'
]);

var root = $.from_html(`<div><!></div>`);

export default function Context_menu_content_static($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		ref = $.prop($$props, 'ref', 15, null),
		loop = $.prop($$props, 'loop', 3, true),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		onCloseAutoFocus = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		preventScroll = $.prop($$props, 'preventScroll', 3, true),
		// we need to explicitly pass this prop to the PopperLayer to override
		// the default menu behavior of handling outside interactions on the trigger
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = MenuContentState.create({
		id: boxWith(() => id()),
		loop: boxWith(() => loop()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		onCloseAutoFocus: boxWith(() => onCloseAutoFocus())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

	function handleInteractOutside(e) {
		onInteractOutside()(e);

		if (e.defaultPrevented) return;

		contentState.parentMenu.onClose();
	}

	function handleEscapeKeydown(e) {
		onEscapeKeydown()(e);

		if (e.defaultPrevented) return;

		contentState.parentMenu.onClose();
	}

	function isValidEvent(e) {
		if ("button" in e && e.button === 2) {
			const target = e.target;

			if (!target) return false;

			const isAnotherContextTrigger = target.closest(`[${CONTEXT_MENU_TRIGGER_ATTR}]`) !== contentState.parentMenu.triggerNode;

			return isAnotherContextTrigger;
		}

		return false;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("context-menu") }, { style: $$props.style }));
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ({ props: $.get(finalProps), ...contentState.snippetProps }));

								$.snippet(node_2, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var div = root();

							$.attribute_effect(div, () => ({ ...$.get(finalProps) }));

							var node_3 = $.child(div);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.reset(div);
							$.append($$anchor, div);
						};

						$.if(node_1, ($$render) => {
							if ($$props.child) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				PopperLayerForceMount($$anchor, $.spread_props(() => $.get(mergedProps), () => contentState.popperProps, {
					get ref() {
						return contentState.opts.ref;
					},
					isStatic: true,
					side: 'right',
					sideOffset: 2,
					align: 'start',
					get enabled() {
						return contentState.parentMenu.opts.open.current;
					},

					get preventScroll() {
						return preventScroll();
					},
					onInteractOutside: handleInteractOutside,
					onEscapeKeydown: handleEscapeKeydown,
					isValidEvent,
					trapFocus: true,
					get loop() {
						return loop();
					},

					get forceMount() {
						return forceMount();
					},

					get id() {
						return id();
					},

					get shouldRender() {
						return contentState.shouldRender;
					},
					popper,
					$$slots: { popper: true }
				}));
			}
		};

		var consequent_3 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("context-menu") }, { style: $$props.style }));
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							{
								let $0 = $.derived(() => ({ props: $.get(finalProps), ...contentState.snippetProps }));

								$.snippet(node_5, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_6);
						};

						var alternate_1 = ($$anchor) => {
							var div_1 = root();

							$.attribute_effect(div_1, () => ({ ...$.get(finalProps) }));

							var node_6 = $.child(div_1);

							$.snippet(node_6, () => $$props.children ?? $.noop);
							$.reset(div_1);
							$.append($$anchor, div_1);
						};

						$.if(node_4, ($$render) => {
							if ($$props.child) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_5);
				};

				PopperLayer($$anchor, $.spread_props(() => $.get(mergedProps), () => contentState.popperProps, {
					get ref() {
						return contentState.opts.ref;
					},
					isStatic: true,
					side: 'right',
					sideOffset: 2,
					align: 'start',
					get open() {
						return contentState.parentMenu.opts.open.current;
					},

					get preventScroll() {
						return preventScroll();
					},
					onInteractOutside: handleInteractOutside,
					onEscapeKeydown: handleEscapeKeydown,
					isValidEvent,
					trapFocus: true,
					get loop() {
						return loop();
					},
					forceMount: false,
					get id() {
						return id();
					},

					get shouldRender() {
						return contentState.shouldRender;
					},
					popper,
					$$slots: { popper: true }
				}));
			}
		};

		$.if(node, ($$render) => {
			if (forceMount()) $$render(consequent_1); else if (!forceMount()) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}