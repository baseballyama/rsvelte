import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { LinkPreviewContentState } from "../link-preview.svelte.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Link_preview_content($$renderer, $$props) {
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
			hideWhenDetached = false,
			collisionPadding = 0,
			onInteractOutside = noop,
			onEscapeKeydown = noop,
			forceMount = false,
			style,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = LinkPreviewContentState.create({
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
			collisionPadding
		}));

		const mergedProps = $.derived(() => mergeProps(restProps, floatingProps(), contentState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (forceMount) {
				$$renderer.push('<!--[0-->');

				{
					function popper($$renderer, { props, wrapperProps }) {
						const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("link-preview") }, { style });

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

						$$renderer.push(`<!--]--> `);

						Mounted($$renderer, {
							get mounted() {
								return contentState.root.contentMounted;
							},

							set mounted($$value) {
								contentState.root.contentMounted = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					}

					PopperLayerForceMount($$renderer, $.spread_props([
						mergedProps(),
						contentState.popperProps,
						{
							ref: contentState.opts.ref,
							enabled: contentState.root.opts.open.current,
							id,
							trapFocus: false,
							loop: false,
							preventScroll: false,
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
						const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("link-preview") }, { style });

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

						$$renderer.push(`<!--]--> `);

						Mounted($$renderer, {
							get mounted() {
								return contentState.root.contentMounted;
							},

							set mounted($$value) {
								contentState.root.contentMounted = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					}

					PopperLayer($$renderer, $.spread_props([
						mergedProps(),
						contentState.popperProps,
						{
							ref: contentState.opts.ref,
							open: contentState.root.opts.open.current,
							id,
							trapFocus: false,
							loop: false,
							preventScroll: false,
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}