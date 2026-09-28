import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuOpenEvent, MenuContentState } from "../menu.svelte.js";
import { SUB_CLOSE_KEYS } from "../utils.js";
import { createId } from "$lib/internal/create-id.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { isHTMLElement } from "$lib/internal/is.js";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

export default function Menu_sub_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			children,
			child,
			loop = true,
			onInteractOutside = noop,
			forceMount = false,
			onEscapeKeydown = noop,
			interactOutsideBehavior = "defer-otherwise-close",
			escapeKeydownBehavior = "defer-otherwise-close",
			onOpenAutoFocus: onOpenAutoFocusProp = noop,
			onCloseAutoFocus: onCloseAutoFocusProp = noop,
			onFocusOutside = noop,
			side = "right",
			trapFocus = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const subContentState = MenuContentState.create({
			id: boxWith(() => id),
			loop: boxWith(() => loop),
			ref: boxWith(() => ref, (v) => ref = v),
			isSub: true,
			onCloseAutoFocus: boxWith(() => handleCloseAutoFocus)
		});

		function onkeydown(e) {
			const isKeyDownInside = e.currentTarget.contains(e.target);
			const isCloseKey = SUB_CLOSE_KEYS[subContentState.parentMenu.root.opts.dir.current].includes(e.key);

			if (isKeyDownInside && isCloseKey) {
				subContentState.parentMenu.onClose();

				const triggerNode = subContentState.parentMenu.triggerNode;

				triggerNode?.focus();
				e.preventDefault();
			}
		}

		const dataAttr = $.derived(() => subContentState.parentMenu.root.getBitsAttr("sub-content"));
		const mergedProps = $.derived(() => mergeProps(restProps, subContentState.props, { side, onkeydown, [dataAttr()]: "" }));

		function handleOpenAutoFocus(e) {
			onOpenAutoFocusProp(e);

			if (e.defaultPrevented) return;

			e.preventDefault();

			if (subContentState.parentMenu.root.isUsingKeyboard && subContentState.parentMenu.contentNode) {
				MenuOpenEvent.dispatch(subContentState.parentMenu.contentNode);
			}
		}

		function handleCloseAutoFocus(e) {
			onCloseAutoFocusProp(e);

			if (e.defaultPrevented) return;

			e.preventDefault();
		}

		function handleInteractOutside(e) {
			onInteractOutside(e);

			if (e.defaultPrevented) return;

			subContentState.parentMenu.onClose();
		}

		function handleEscapeKeydown(e) {
			onEscapeKeydown(e);

			if (e.defaultPrevented) return;

			subContentState.parentMenu.onClose();
		}

		function handleOnFocusOutside(e) {
			onFocusOutside(e);

			if (e.defaultPrevented) return;
			if (!isHTMLElement(e.target)) return;
			if (e.target.id === subContentState.parentMenu.triggerNode?.id) return;

			const parentContent = subContentState.parentMenu.parentMenu?.contentNode;

			if (parentContent?.contains(e.target)) {
				subContentState.parentMenu.onClose();
				e.preventDefault();

				return;
			}

			// focus moved to a descendant sub-content rendered in a portal
			const subContentSelector = `[${subContentState.parentMenu.root.getBitsAttr("sub-content")}]`;

			if (e.target.closest(subContentSelector)) {
				e.preventDefault();

				return;
			}

			subContentState.parentMenu.onClose();
		}

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, mergedProps(), { style: getFloatingContentCSSVars("menu") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...subContentState.snippetProps
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
					{
						ref: subContentState.opts.ref,
						interactOutsideBehavior,
						escapeKeydownBehavior,
						onOpenAutoFocus: handleOpenAutoFocus,
						enabled: subContentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						onFocusOutside: handleOnFocusOutside,
						preventScroll: false,
						loop,
						trapFocus,
						shouldRender: subContentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push('<!--[1-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, mergedProps(), { style: getFloatingContentCSSVars("menu") }, { style });

					if (child) {
						$$renderer.push('<!--[0-->');

						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...subContentState.snippetProps
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
					{
						ref: subContentState.opts.ref,
						interactOutsideBehavior,
						escapeKeydownBehavior,
						onCloseAutoFocus: handleCloseAutoFocus,
						onOpenAutoFocus: handleOpenAutoFocus,
						open: subContentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						onFocusOutside: handleOnFocusOutside,
						preventScroll: false,
						loop,
						trapFocus,
						shouldRender: subContentState.shouldRender,
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