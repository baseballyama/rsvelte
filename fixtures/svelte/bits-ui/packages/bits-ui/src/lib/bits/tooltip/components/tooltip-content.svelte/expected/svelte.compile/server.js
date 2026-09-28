import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { TooltipContentState } from "../tooltip.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";
import { noop } from "$lib/internal/noop.js";

export default function Tooltip_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			id = createId(uid),
			ref = null,
			side = "top",
			sideOffset = 0,
			align = "center",
			avoidCollisions = true,
			arrowPadding = 0,
			sticky = "partial",
			strategy,
			hideWhenDetached = false,
			customAnchor,
			collisionPadding = 0,
			onInteractOutside = noop,
			onEscapeKeydown = noop,
			forceMount = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = TooltipContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown)
		});

		const floatingProps = $.derived(() => ({
			side,
			sideOffset,
			align,
			avoidCollisions,
			arrowPadding,
			sticky,
			hideWhenDetached,
			collisionPadding,
			strategy,
			customAnchor: customAnchor ?? contentState.root.triggerNode
		}));

		const mergedProps = $.derived(() => mergeProps(restProps, floatingProps(), contentState.props));

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, {
						style: {
							pointerEvents: contentState.root.disableHoverableContent ? "none" : undefined
						}
					});

					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...finalWrapperProps })}><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayerForceMount($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: true,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push('<!--[1-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, {
						style: {
							pointerEvents: contentState.root.disableHoverableContent ? "none" : undefined
						}
					});

					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...finalWrapperProps })}><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayer($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						open: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: false,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}