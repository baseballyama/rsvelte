import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';
import { prefixFilter } from '@smui/common/internal';
import { Label } from '@smui/common';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';
import Snackbar from '../Snackbar.svelte';
import Actions from '../Actions.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'dismiss']);
var root = $.from_html(`<!> <!>`, 1);

export default function Kitchen($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	/**
	 * If provided, the button will act as a link.
	 */
	/**
	 * The tag name of the element to create.
	 */
	/**
	 * A spot for the dismiss icon contents.
	 */
	let element = $.state(void 0);

	let snackbars = $.proxy([]);
	let config = $.state(void 0);
	let waiting = $.state(false);

	$.user_effect(() => {
		if (snackbars.length && $.get(config) == null) {
			$.set(config, snackbars[0], true);
			$.set(waiting, true);
		}
	});

	$.user_effect(() => {
		if ($.get(element) && $.get(waiting) && !$.get(element).isOpen()) {
			$.set(waiting, false);

			// Let the snackbar render its elements.
			tick().then(() => {
				if ($.get(element)) {
					$.get(element).open();
				}
			});
		}
	});

	function handleClosed(e) {
		if ($.get(config)?.onClose) {
			$.get(config).onClose(e);
		}

		snackbars.splice(0, 1);

		// Let the snackbar handle its close event.
		tick().then(() => {
			$.set(config, undefined);
		});
	}

	function handleActionClick(action, e) {
		if (action.onClick) {
			action.onClick(e);
		}
	}

	function handleDismiss(e) {
		if ($.get(config)?.onDismiss) {
			$.get(config).onDismiss(e);
		}
	}

	function push(config) {
		snackbars.push(config);
	}

	function getElement() {
		return $.get(element)?.getElement();
	}

	var $$exports = { push, getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'snackbar$'));

				$.bind_this(
					Snackbar($$anchor, $.spread_props(
						{
							get labelText() {
								return $.get(config).label;
							}
						},
						() => $.get(config) && $.get(config).props || {},
						() => $.get($0),
						{
							onSMUISnackbarClosed: (e) => {
								handleClosed(e);
								$$props.snackbar$onSMUISnackbarClosed?.(e);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_1 = $.first_child(fragment_2);

								{
									let $0 = $.derived(() => prefixFilter(restProps, 'label$'));

									Label(node_1, $.spread_props(() => $.get($0)));
								}

								var node_2 = $.sibling(node_1, 2);

								{
									var consequent_3 = ($$anchor) => {
										Actions($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												{
													var consequent = ($$anchor) => {
														var fragment_5 = $.comment();
														var node_4 = $.first_child(fragment_5);

														$.each(node_4, 17, () => $.get(config).actions, $.index, ($$anchor, action) => {
															{
																let $0 = $.derived(() => prefixFilter(restProps, 'action$'));

																Button($$anchor, $.spread_props(() => $.get($0), {
																	onclick: (e) => {
																		handleActionClick($.get(action), e);
																		$$props.action$onclick?.(e);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text();

																		$.template_effect(() => $.set_text(text, $.get(action).text));
																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																}));
															}
														});

														$.append($$anchor, fragment_5);
													};

													$.if(node_3, ($$render) => {
														if ($.get(config).actions) $$render(consequent);
													});
												}

												var node_5 = $.sibling(node_3, 2);

												{
													var consequent_2 = ($$anchor) => {
														{
															let $0 = $.derived(() => $.get(config).dismissTitle || 'Dismiss');
															let $1 = $.derived(() => prefixFilter(restProps, 'dismiss$'));

															IconButton($$anchor, $.spread_props(
																{
																	get title() {
																		return $.get($0);
																	}
																},
																() => $.get($1),
																{
																	onclick: (e) => {
																		handleDismiss(e);
																		$$props.dismiss$onclick?.(e);
																	},

																	children: ($$anchor, $$slotProps) => {
																		{
																			let $0 = $.derived(() => prefixFilter(restProps, 'dismissIcon$'));

																			Icon($$anchor, $.spread_props(() => $.get($0), {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = $.comment();
																					var node_6 = $.first_child(fragment_10);

																					{
																						var consequent_1 = ($$anchor) => {
																							var fragment_11 = $.comment();
																							var node_7 = $.first_child(fragment_11);

																							$.snippet(node_7, () => $$props.dismiss ?? $.noop);
																							$.append($$anchor, fragment_11);
																						};

																						var alternate = ($$anchor) => {
																							var text_1 = $.text();

																							$.template_effect(() => $.set_text(text_1, $.get(config).dismissText ?? 'close'));
																							$.append($$anchor, text_1);
																						};

																						$.if(node_6, ($$render) => {
																							if ($$props.dismiss) $$render(consequent_1); else $$render(alternate, -1);
																						});
																					}

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			}));
																		}
																	},
																	$$slots: { default: true }
																}
															));
														}
													};

													$.if(node_5, ($$render) => {
														if ($.get(config).dismissButton) $$render(consequent_2);
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_2, ($$render) => {
										if ($.get(config).actions || $.get(config).dismissButton) $$render(consequent_3);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}
					)),
					($$value) => $.set(element, $$value, true),
					() => $.get(element)
				);
			}
		};

		$.if(node, ($$render) => {
			if ($.get(config)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}