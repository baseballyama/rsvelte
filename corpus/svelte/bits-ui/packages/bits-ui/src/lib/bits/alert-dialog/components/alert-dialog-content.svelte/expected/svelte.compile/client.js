import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterSleep, boxWith, mergeProps } from "svelte-toolbelt";
import DismissibleLayer from "$lib/bits/utilities/dismissible-layer/dismissible-layer.svelte";
import EscapeLayer from "$lib/bits/utilities/escape-layer/escape-layer.svelte";
import FocusScope from "$lib/bits/utilities/focus-scope/focus-scope.svelte";
import TextSelectionLayer from "$lib/bits/utilities/text-selection-layer/text-selection-layer.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import ScrollLock from "$lib/bits/utilities/scroll-lock/scroll-lock.svelte";
import { DialogContentState } from "$lib/bits/dialog/dialog.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'children',
	'child',
	'ref',
	'forceMount',
	'interactOutsideBehavior',
	'onCloseAutoFocus',
	'onEscapeKeydown',
	'onOpenAutoFocus',
	'onInteractOutside',
	'preventScroll',
	'trapFocus',
	'restoreScrollDelay'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function Alert_dialog_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "ignore"),
		onCloseAutoFocus = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		onOpenAutoFocus = $.prop($$props, 'onOpenAutoFocus', 3, noop),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		preventScroll = $.prop($$props, 'preventScroll', 3, true),
		trapFocus = $.prop($$props, 'trapFocus', 3, true),
		restoreScrollDelay = $.prop($$props, 'restoreScrollDelay', 3, null),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = DialogContentState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			{
				const focusScope = ($$anchor, $$arg0) => {
					let focusScopeProps = () => ($$arg0?.()).props;

					EscapeLayer($$anchor, $.spread_props(() => $.get(mergedProps), {
						get enabled() {
							return contentState.root.opts.open.current;
						},

						get ref() {
							return contentState.opts.ref;
						},

						onEscapeKeydown: (e) => {
							onEscapeKeydown()(e);

							if (e.defaultPrevented) return;

							contentState.root.handleClose();
						},

						children: ($$anchor, $$slotProps) => {
							DismissibleLayer($$anchor, $.spread_props(() => $.get(mergedProps), {
								get ref() {
									return contentState.opts.ref;
								},

								get enabled() {
									return contentState.root.opts.open.current;
								},

								get interactOutsideBehavior() {
									return interactOutsideBehavior();
								},

								onInteractOutside: (e) => {
									onInteractOutside()(e);

									if (e.defaultPrevented) return;

									contentState.root.handleClose();
								},

								children: ($$anchor, $$slotProps) => {
									TextSelectionLayer($$anchor, $.spread_props(() => $.get(mergedProps), {
										get ref() {
											return contentState.opts.ref;
										},

										get enabled() {
											return contentState.root.opts.open.current;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_1 = $.first_child(fragment_5);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_6 = root();
													var node_2 = $.first_child(fragment_6);

													{
														var consequent = ($$anchor) => {
															ScrollLock($$anchor, {
																get preventScroll() {
																	return preventScroll();
																},

																get restoreScrollDelay() {
																	return restoreScrollDelay();
																}
															});
														};

														$.if(node_2, ($$render) => {
															if (contentState.root.opts.open.current) $$render(consequent);
														});
													}

													var node_3 = $.sibling(node_2, 2);

													{
														let $0 = $.derived(() => ({
															props: mergeProps($.get(mergedProps), focusScopeProps()),
															...contentState.snippetProps
														}));

														$.snippet(node_3, () => $$props.child, () => $.get($0));
													}

													$.append($$anchor, fragment_6);
												};

												var alternate = ($$anchor) => {
													var fragment_8 = root_1();
													var node_4 = $.first_child(fragment_8);

													ScrollLock(node_4, {
														get preventScroll() {
															return preventScroll();
														}
													});

													var div = $.sibling(node_4, 2);

													$.attribute_effect(div, ($0) => ({ ...$0 }), [() => mergeProps($.get(mergedProps), focusScopeProps())]);

													var node_5 = $.child(div);

													$.snippet(node_5, () => $$props.children ?? $.noop);
													$.reset(div);
													$.append($$anchor, fragment_8);
												};

												$.if(node_1, ($$render) => {
													if ($$props.child) $$render(consequent_1); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									}));
								},
								$$slots: { default: true }
							}));
						},
						$$slots: { default: true }
					}));
				};

				FocusScope($$anchor, {
					get ref() {
						return contentState.opts.ref;
					},
					loop: true,
					get trapFocus() {
						return trapFocus();
					},

					get enabled() {
						return contentState.root.opts.open.current;
					},

					get onCloseAutoFocus() {
						return onCloseAutoFocus();
					},

					onOpenAutoFocus: (e) => {
						onOpenAutoFocus()(e);

						if (e.defaultPrevented) return;

						e.preventDefault();
						afterSleep(0, () => contentState.opts.ref.current?.focus());
					},
					focusScope,
					$$slots: { focusScope: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if (contentState.shouldRender || forceMount()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}