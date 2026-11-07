import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverContentState } from "../popover.svelte.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Popover_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			ref = null,
			id = createId(uid),
			forceMount = false,
			onOpenAutoFocus = noop,
			onCloseAutoFocus = noop,
			onEscapeKeydown = noop,
			onInteractOutside = noop,
			trapFocus = true,
			preventScroll = false,
			customAnchor = null,
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
			customAnchor: boxWith(() => customAnchor)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		// respect user's trapFocus setting, but disable when hover-opened without interaction
		const effectiveTrapFocus = $.derived(() => trapFocus && contentState.shouldTrapFocus);

		// prevent auto-focus when opened via hover until user interacts
		function handleOpenAutoFocus(e) {
			if (!contentState.shouldTrapFocus) {
				e.preventDefault();
			}

			onOpenAutoFocus(e);
		}

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayerForceMount($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus: effectiveTrapFocus(),
						preventScroll,
						loop: true,
						forceMount: true,
						customAnchor,
						onOpenAutoFocus: handleOpenAutoFocus,
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
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("popover") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				PopperLayer($$renderer, $.spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						open: contentState.root.opts.open.current,
						id,
						trapFocus: effectiveTrapFocus(),
						preventScroll,
						loop: true,
						forceMount: false,
						customAnchor,
						onOpenAutoFocus: handleOpenAutoFocus,
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