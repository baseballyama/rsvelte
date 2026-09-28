import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectContentState } from "../select.svelte.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";
import { createId } from "$lib/internal/create-id.js";

export default function Select_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			forceMount = false,
			side = "bottom",
			onInteractOutside = noop,
			onEscapeKeydown = noop,
			children,
			child,
			preventScroll = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = SelectContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		if (forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: contentState.props.style }, { style });

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
						side,
						enabled: contentState.root.opts.open.current,
						id,
						preventScroll,
						forceMount: true,
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
					const finalProps = mergeProps(props, { style: contentState.props.style }, { style });

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
						side,
						open: contentState.root.opts.open.current,
						id,
						preventScroll,
						forceMount: false,
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