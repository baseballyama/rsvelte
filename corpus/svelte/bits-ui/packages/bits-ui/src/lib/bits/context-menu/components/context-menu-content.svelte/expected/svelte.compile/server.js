import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CONTEXT_MENU_TRIGGER_ATTR, MenuContentState } from "$lib/bits/menu/menu.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { noop } from "$lib/internal/noop.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Context_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			child,
			children,
			ref = null,
			loop = true,
			onInteractOutside = noop,
			onCloseAutoFocus = noop,
			onOpenAutoFocus = noop,
			preventScroll = true,
			side = "right",
			sideOffset = 2,
			align = "start",
			// we need to explicitly pass this prop to the PopperLayer to override
			// the default menu behavior of handling outside interactions on the trigger
			onEscapeKeydown = noop,
			forceMount = false,
			trapFocus = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = MenuContentState.create({
			id: boxWith(() => id),
			loop: boxWith(() => loop),
			ref: boxWith(() => ref, (v) => ref = v),
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props, {
			side,
			sideOffset,
			align,
			onOpenAutoFocus,
			isValidEvent,
			trapFocus,
			loop,
			id,
			ref: contentState.opts.ref,
			preventScroll,
			onInteractOutside: handleInteractOutside,
			onEscapeKeydown: handleEscapeKeydown,
			shouldRender: contentState.shouldRender
		}));

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

		function isValidEvent(e) {
			if ("button" in e && e.button === 2) {
				const target = e.target;

				if (!target) return false;

				const isAnotherContextTrigger = target.closest(`[${CONTEXT_MENU_TRIGGER_ATTR}]`) !== contentState.parentMenu.triggerNode;

				return isAnotherContextTrigger;
			}

			return false;
		}

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("context-menu") }, { style });

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
						enabled: contentState.parentMenu.opts.open.current,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push('<!--[1-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("context-menu") }, { style });

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
						open: contentState.parentMenu.opts.open.current,
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