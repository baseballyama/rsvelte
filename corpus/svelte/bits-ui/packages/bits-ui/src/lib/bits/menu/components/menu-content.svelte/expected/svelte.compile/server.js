import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuContentState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			child,
			children,
			ref = null,
			loop = true,
			onInteractOutside = noop,
			onEscapeKeydown = noop,
			onCloseAutoFocus: onCloseAutoFocusProp = noop,
			forceMount = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = MenuContentState.create({
			id: boxWith(() => id),
			loop: boxWith(() => loop),
			ref: boxWith(() => ref, (v) => ref = v),
			onCloseAutoFocus: boxWith(() => onCloseAutoFocusProp)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props, { style: { outline: "none" } }));

		function handleInteractOutside(e) {
			onInteractOutside(e);

			if (e.defaultPrevented) return;

			// don't close if the interaction is with a submenu content or items
			if (e.target && e.target instanceof Element) {
				const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;

				if (e.target.closest(subContentSelector)) return;
			}

			contentState.parentMenu.onClose();
		}

		function handleEscapeKeydown(e) {
			onEscapeKeydown(e);

			if (e.defaultPrevented) return;

			contentState.parentMenu.onClose();
		}

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(
						props,
						{
							style: { outline: "none", ...getFloatingContentCSSVars("menu") }
						},
						{ style }
					);

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
						enabled: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus: true,
						loop,
						forceMount: true,
						id,
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
					const finalProps = mergeProps(
						props,
						{
							style: { outline: "none", ...getFloatingContentCSSVars("menu") }
						},
						{ style }
					);

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
						open: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus: true,
						loop,
						forceMount: false,
						id,
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