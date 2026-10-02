import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverContentState } from "../popover.svelte.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
	'ref',
	'id',
	'forceMount',
	'onOpenAutoFocus',
	'onCloseAutoFocus',
	'onEscapeKeydown',
	'onInteractOutside',
	'trapFocus',
	'preventScroll',
	'customAnchor',
	'style'
]);

var root = $.from_html(`<div><div><!></div></div>`);

export default function Popover_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		onOpenAutoFocus = $.prop($$props, 'onOpenAutoFocus', 3, noop),
		onCloseAutoFocus = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		trapFocus = $.prop($$props, 'trapFocus', 3, true),
		preventScroll = $.prop($$props, 'preventScroll', 3, false),
		customAnchor = $.prop($$props, 'customAnchor', 3, null),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = PopoverContentState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		onInteractOutside: boxWith(() => onInteractOutside()),
		onEscapeKeydown: boxWith(() => onEscapeKeydown()),
		customAnchor: boxWith(() => customAnchor())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

	// respect user's trapFocus setting, but disable when hover-opened without interaction
	const effectiveTrapFocus = $.derived(() => trapFocus() && contentState.shouldTrapFocus);

	// prevent auto-focus when opened via hover until user interacts
	function handleOpenAutoFocus(e) {
		if (!contentState.shouldTrapFocus) {
			e.preventDefault();
		}

		onOpenAutoFocus()(e);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					let wrapperProps = () => ($$arg0?.()).wrapperProps;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("popover") }, { style: $$props.style }));
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ({
									props: $.get(finalProps),
									wrapperProps: wrapperProps(),
									...contentState.snippetProps
								}));

								$.snippet(node_2, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var div = root();

							$.attribute_effect(div, () => ({ ...wrapperProps() }));

							var div_1 = $.child(div);

							$.attribute_effect(div_1, () => ({ ...$.get(finalProps) }));

							var node_3 = $.child(div_1);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.reset(div_1);
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

					get enabled() {
						return contentState.root.opts.open.current;
					},

					get id() {
						return id();
					},

					get trapFocus() {
						return $.get(effectiveTrapFocus);
					},

					get preventScroll() {
						return preventScroll();
					},
					loop: true,
					forceMount: true,
					get customAnchor() {
						return customAnchor();
					},
					onOpenAutoFocus: handleOpenAutoFocus,
					get onCloseAutoFocus() {
						return onCloseAutoFocus();
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
					let wrapperProps = () => ($$arg0?.()).wrapperProps;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("popover") }, { style: $$props.style }));
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							{
								let $0 = $.derived(() => ({
									props: $.get(finalProps),
									wrapperProps: wrapperProps(),
									...contentState.snippetProps
								}));

								$.snippet(node_5, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_6);
						};

						var alternate_1 = ($$anchor) => {
							var div_2 = root();

							$.attribute_effect(div_2, () => ({ ...wrapperProps() }));

							var div_3 = $.child(div_2);

							$.attribute_effect(div_3, () => ({ ...$.get(finalProps) }));

							var node_6 = $.child(div_3);

							$.snippet(node_6, () => $$props.children ?? $.noop);
							$.reset(div_3);
							$.reset(div_2);
							$.append($$anchor, div_2);
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

					get open() {
						return contentState.root.opts.open.current;
					},

					get id() {
						return id();
					},

					get trapFocus() {
						return $.get(effectiveTrapFocus);
					},

					get preventScroll() {
						return preventScroll();
					},
					loop: true,
					forceMount: false,
					get customAnchor() {
						return customAnchor();
					},
					onOpenAutoFocus: handleOpenAutoFocus,
					get onCloseAutoFocus() {
						return onCloseAutoFocus();
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