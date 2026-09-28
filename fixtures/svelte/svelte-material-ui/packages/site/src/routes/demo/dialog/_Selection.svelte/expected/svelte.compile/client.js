import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import List, { Item, Graphic, Text } from '@smui/list';
import Radio from '@smui/radio';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _Selection($$anchor) {
	const binding_group = [];
	let open = $.state(false);
	let selection = $.state('Radishes');
	let selected = $.state('Nothing yet.');

	function closeHandler(e) {
		if (e.detail.action === 'accept') {
			$.set(selected, $.get(selection), true);
		}

		$.set(selection, 'Radishes');
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		selection: true,
		'aria-labelledby': 'list-selection-title',
		'aria-describedby': 'list-selection-content',
		onSMUIDialogClosed: closeHandler,
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'list-selection-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dialog Title');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'list-selection-content',
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						radioList: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => [InitialFocus]);

								Item(node_3, {
									get use() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										Graphic(node_4, {
											children: ($$anchor, $$slotProps) => {
												Radio($$anchor, {
													value: 'Radishes',
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

												var text_1 = $.text('Radishes');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}

							var node_6 = $.sibling(node_3, 2);

							Item(node_6, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									Graphic(node_7, {
										children: ($$anchor, $$slotProps) => {
											Radio($$anchor, {
												value: 'Turnips',
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

											var text_2 = $.text('Turnips');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_6, 2);

							Item(node_9, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_10 = $.first_child(fragment_8);

									Graphic(node_10, {
										children: ($$anchor, $$slotProps) => {
											Radio($$anchor, {
												value: 'Broccoli',
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

									var node_11 = $.sibling(node_10, 2);

									Text(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Broccoli');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_2, 2);

			Actions(node_12, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_13 = $.first_child(fragment_10);

					Button(node_13, {
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Cancel');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Button(node_14, {
						action: 'accept',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Accept');

									$.append($$anchor, text_5);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node, 2);

	Button(node_15, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Open Dialog');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_15, 2);
	var text_7 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_7, `Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}