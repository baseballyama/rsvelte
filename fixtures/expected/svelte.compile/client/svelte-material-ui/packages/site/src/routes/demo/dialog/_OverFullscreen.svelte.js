import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import Dialog, {
	Header,
	Title,
	CloseTooltipWrapper,
	Content,
	Actions,
	InitialFocus
} from '@smui/dialog';

import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import List, { Item, Graphic, Text } from '@smui/list';
import Radio from '@smui/radio';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _OverFullscreen($$anchor) {
	const binding_group = [];
	let open = $.state(false);
	let subOpen = $.state(false);
	let selection = $.state('Radishes');
	let selected = $.state('Nothing yet.');
	let response = $.state('Nothing yet.');

	function confirmationCloseHandler(e) {
		if (e.detail.action === 'accept') {
			$.set(selected, $.get(selection), true);
		}

		$.set(selection, 'Radishes');
	}

	function closeHandler(e) {
		switch (e.detail.action) {
			case 'close':
				$.set(response, 'Closed without response.');
				break;

			case 'reject':
				$.set(response, 'Rejected.');
				break;

			case 'accept':
				$.set(response, 'Accepted.');
				break;
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const over = ($$anchor) => {
			Dialog($$anchor, {
				selection: true,
				'aria-labelledby': 'over-fullscreen-confirmation-title',
				'aria-describedby': 'over-fullscreen-confirmation-content',
				onSMUIDialogClosed: confirmationCloseHandler,
				get open() {
					return $.get(subOpen);
				},

				set open($$value) {
					$.set(subOpen, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					Header(node_1, {
						children: ($$anchor, $$slotProps) => {
							Title($$anchor, {
								id: 'over-fullscreen-confirmation-title',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Confirmation');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Content(node_2, {
						id: 'over-fullscreen-confirmation-content',
						children: ($$anchor, $$slotProps) => {
							List($$anchor, {
								radioList: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_3 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => [InitialFocus]);

										Item(node_3, {
											get use() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_4 = $.first_child(fragment_6);

												Graphic(node_4, {
													children: ($$anchor, $$slotProps) => {
														Radio($$anchor, {
															value: 'One',
															get group() {
																return $.get(selection);
															},

															set group($$value) {
																$.set(selection, $$value, true);
															}
														});
													},
													$$slots: { default: true }
												});

												var node_5 = $.sibling(node_4, 2);

												Text(node_5, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Choice 1');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									}

									var node_6 = $.sibling(node_3, 2);

									Item(node_6, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root();
											var node_7 = $.first_child(fragment_8);

											Graphic(node_7, {
												children: ($$anchor, $$slotProps) => {
													Radio($$anchor, {
														value: 'Two',
														get group() {
															return $.get(selection);
														},

														set group($$value) {
															$.set(selection, $$value, true);
														}
													});
												},
												$$slots: { default: true }
											});

											var node_8 = $.sibling(node_7, 2);

											Text(node_8, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Choice 2');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_2, 2);

					Actions(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_10 = $.first_child(fragment_10);

							Button(node_10, {
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Cancel');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							Button(node_11, {
								action: 'accept',
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Accept');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Dialog(node, {
			fullscreen: true,
			'aria-labelledby': 'over-fullscreen-title',
			'aria-describedby': 'over-fullscreen-content',
			onSMUIDialogClosed: closeHandler,
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			over,
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_1();
				var node_12 = $.first_child(fragment_13);

				Header(node_12, {
					children: ($$anchor, $$slotProps) => {
						var fragment_14 = root();
						var node_13 = $.first_child(fragment_14);

						Title(node_13, {
							id: 'over-fullscreen-title',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Terms and Conditions');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_13, 2);

						CloseTooltipWrapper(node_14, {
							children: ($$anchor, $$slotProps) => {
								IconButton($$anchor, {
									action: 'close',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('close');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_12, 2);

				Content(node_15, {
					id: 'over-fullscreen-content',
					children: ($$anchor, $$slotProps) => {
						var fragment_17 = root();
						var node_16 = $.first_child(fragment_17);

						Button(node_16, {
							onclick: () => $.set(subOpen, true),
							children: ($$anchor, $$slotProps) => {
								Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Open Confirmation Dialog');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_17 = $.sibling(node_16, 2);

						$.each(node_17, 16, () => Array(3), $.index, ($$anchor, _item) => {
							LoremIpsum($$anchor, {});
						});

						$.append($$anchor, fragment_17);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_15, 2);

				Actions(node_18, {
					children: ($$anchor, $$slotProps) => {
						var fragment_20 = root();
						var node_19 = $.first_child(fragment_20);

						Button(node_19, {
							action: 'reject',
							children: ($$anchor, $$slotProps) => {
								Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text('Reject');

										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_20 = $.sibling(node_19, 2);

						Button(node_20, {
							action: 'accept',
							defaultAction: true,
							children: ($$anchor, $$slotProps) => {
								Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Accept');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_20);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { over: true, default: true }
		});
	}

	var node_21 = $.sibling(node, 2);

	Button(node_21, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Open Dialog');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_21, 2);
	var text_11 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_11, `Response: ${$.get(response) ?? ''}, Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}