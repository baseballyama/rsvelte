import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CONTEXT_MENU_TRIGGER_ATTR, MenuContentState } from "$lib/bits/menu/menu.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { noop } from "$lib/internal/noop.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Context_menu_content_static($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			child,
			children,
			ref = null,
			loop = true,
			onInteractOutside = noop,
			onCloseAutoFocus = noop,
			preventScroll = true,
			// we need to explicitly pass this prop to the PopperLayer to override
			// the default menu behavior of handling outside interactions on the trigger
			onEscapeKeydown = noop,
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
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		function handleInteractOutside(e) {
			onInteractOutside(e);

			if (e.defaultPrevented) return;

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
				function popper($$renderer, { props }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("context-menu") }, { style });

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
						side: 'right',
						sideOffset: 2,
						align: 'start',
						enabled: contentState.parentMenu.opts.open.current,
						preventScroll,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						isValidEvent,
						trapFocus: true,
						loop,
						forceMount,
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
				function popper($$renderer, { props }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("context-menu") }, { style });

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
						side: 'right',
						sideOffset: 2,
						align: 'start',
						open: contentState.parentMenu.opts.open.current,
						preventScroll,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						isValidEvent,
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