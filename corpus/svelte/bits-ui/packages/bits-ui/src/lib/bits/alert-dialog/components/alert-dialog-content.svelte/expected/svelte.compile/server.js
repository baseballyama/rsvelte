import * as $ from 'svelte/internal/server';
import { afterSleep, boxWith, mergeProps } from "svelte-toolbelt";
import DismissibleLayer from "$lib/bits/utilities/dismissible-layer/dismissible-layer.svelte";
import EscapeLayer from "$lib/bits/utilities/escape-layer/escape-layer.svelte";
import FocusScope from "$lib/bits/utilities/focus-scope/focus-scope.svelte";
import TextSelectionLayer from "$lib/bits/utilities/text-selection-layer/text-selection-layer.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import ScrollLock from "$lib/bits/utilities/scroll-lock/scroll-lock.svelte";
import { DialogContentState } from "$lib/bits/dialog/dialog.svelte.js";

export default function Alert_dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			children,
			child,
			ref = null,
			forceMount = false,
			interactOutsideBehavior = "ignore",
			onCloseAutoFocus = noop,
			onEscapeKeydown = noop,
			onOpenAutoFocus = noop,
			onInteractOutside = noop,
			preventScroll = true,
			trapFocus = true,
			restoreScrollDelay = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const contentState = DialogContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

		if (contentState.shouldRender || forceMount) {
			$$renderer.push('<!--[0-->');

			{
				function focusScope($$renderer, { props: focusScopeProps }) {
					EscapeLayer($$renderer, $.spread_props([
						mergedProps(),
						{
							enabled: contentState.root.opts.open.current,
							ref: contentState.opts.ref,
							onEscapeKeydown: (e) => {
								onEscapeKeydown(e);

								if (e.defaultPrevented) return;

								contentState.root.handleClose();
							},

							children: ($$renderer) => {
								DismissibleLayer($$renderer, $.spread_props([
									mergedProps(),
									{
										ref: contentState.opts.ref,
										enabled: contentState.root.opts.open.current,
										interactOutsideBehavior,
										onInteractOutside: (e) => {
											onInteractOutside(e);

											if (e.defaultPrevented) return;

											contentState.root.handleClose();
										},

										children: ($$renderer) => {
											TextSelectionLayer($$renderer, $.spread_props([
												mergedProps(),
												{
													ref: contentState.opts.ref,
													enabled: contentState.root.opts.open.current,
													children: ($$renderer) => {
														if (child) {
															$$renderer.push('<!--[0-->');

															if (contentState.root.opts.open.current) {
																$$renderer.push('<!--[0-->');
																ScrollLock($$renderer, { preventScroll, restoreScrollDelay });
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															child($$renderer, {
																props: mergeProps(mergedProps(), focusScopeProps),
																...contentState.snippetProps
															});

															$$renderer.push(`<!---->`);
														} else {
															$$renderer.push('<!--[-1-->');
															ScrollLock($$renderer, { preventScroll });
															$$renderer.push(`<!----> <div${$.attributes({ ...mergeProps(mergedProps(), focusScopeProps) })}>`);
															children?.($$renderer);
															$$renderer.push(`<!----></div>`);
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												}
											]));
										},
										$$slots: { default: true }
									}
								]));
							},
							$$slots: { default: true }
						}
					]));
				}

				FocusScope($$renderer, {
					ref: contentState.opts.ref,
					loop: true,
					trapFocus,
					enabled: contentState.root.opts.open.current,
					onCloseAutoFocus,
					onOpenAutoFocus: (e) => {
						onOpenAutoFocus(e);

						if (e.defaultPrevented) return;

						e.preventDefault();
						afterSleep(0, () => contentState.opts.ref.current?.focus());
					},
					focusScope,
					$$slots: { focusScope: true }
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}