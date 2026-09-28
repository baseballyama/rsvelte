import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverContentState } from "../popover.svelte.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Popover_content_static($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			ref = null,
			id = createId(uid),
			forceMount = false,
			onCloseAutoFocus = noop,
			onEscapeKeydown = noop,
			onInteractOutside = noop,
			trapFocus = true,
			preventScroll = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = PopoverContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown),
			customAnchor: boxWith(() => null)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');
						child($$renderer, { props: finalProps, ...contentState.snippetProps });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayerForceMount($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						isStatic: true,
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus,
						preventScroll,
						loop: true,
						forceMount: true,
						onCloseAutoFocus,
						shouldRender: contentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push('<!--[1-->');

			{
				function popper($$renderer, { props }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');
						child($$renderer, { props: finalProps, ...contentState.snippetProps });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayer($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						isStatic: true,
						open: contentState.root.opts.open.current,
						id,
						trapFocus,
						preventScroll,
						loop: true,
						forceMount: false,
						onCloseAutoFocus,
						shouldRender: contentState.shouldRender,
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