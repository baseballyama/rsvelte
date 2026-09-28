import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="accordion-container"><!></div>`);

export default function _Icon($$anchor) {
	let panel1Open = $.state(false);
	let panel2Open = $.state(false);
	let panel3Open = $.state(false);
	let panel4Open = $.state(false);
	var div = root_2();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			Panel(node_1, {
				get open() {
					return $.get(panel1Open);
				},

				set open($$value) {
					$.set(panel1Open, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					{
						const icon = ($$anchor) => {
							IconButton($$anchor, {
								toggle: true,
								get pressed() {
									return $.get(panel1Open);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									Icon(node_3, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('expand_less');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_4 = $.sibling(node_3, 2);

									Icon(node_4, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('expand_more');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						};

						Header(node_2, {
							icon,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Panel 1');

								$.append($$anchor, text_2);
							},
							$$slots: { icon: true, default: true }
						});
					}

					var node_5 = $.sibling(node_2, 2);

					Content(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('The content for panel 1.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			Panel(node_6, {
				get open() {
					return $.get(panel2Open);
				},

				set open($$value) {
					$.set(panel2Open, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_7 = $.first_child(fragment_4);

					{
						const icon = ($$anchor) => {
							IconButton($$anchor, {
								toggle: true,
								get pressed() {
									return $.get(panel2Open);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_8 = $.first_child(fragment_6);

									Icon(node_8, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('expand_less');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Icon(node_9, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('expand_more');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						};

						Header(node_7, {
							icon,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Panel 2');

								$.append($$anchor, text_6);
							},
							$$slots: { icon: true, default: true }
						});
					}

					var node_10 = $.sibling(node_7, 2);

					Content(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('The content for panel 2.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_6, 2);

			Panel(node_11, {
				get open() {
					return $.get(panel3Open);
				},

				set open($$value) {
					$.set(panel3Open, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_12 = $.first_child(fragment_7);

					{
						const description = ($$anchor) => {
							$.next();

							var text_8 = $.text('Description of panel 3.');

							$.append($$anchor, text_8);
						};

						const icon = ($$anchor) => {
							IconButton($$anchor, {
								toggle: true,
								get pressed() {
									return $.get(panel3Open);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_13 = $.first_child(fragment_9);

									Icon(node_13, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('expand_less');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									Icon(node_14, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('expand_more');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						};

						Header(node_12, {
							description,
							icon,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('Panel 3');

								$.append($$anchor, text_11);
							},
							$$slots: { description: true, icon: true, default: true }
						});
					}

					var node_15 = $.sibling(node_12, 2);

					Content(node_15, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('The content for panel 3.');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_11, 2);

			Panel(node_16, {
				get open() {
					return $.get(panel4Open);
				},

				set open($$value) {
					$.set(panel4Open, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_17 = $.first_child(fragment_10);

					{
						const description = ($$anchor) => {
							$.next();

							var text_13 = $.text('Description of panel 4.');

							$.append($$anchor, text_13);
						};

						const icon = ($$anchor) => {
							IconButton($$anchor, {
								toggle: true,
								get pressed() {
									return $.get(panel4Open);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root();
									var node_18 = $.first_child(fragment_12);

									Icon(node_18, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('expand_less');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Icon(node_19, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('expand_more');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						};

						Header(node_17, {
							description,
							icon,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_16 = $.text('Panel 4');

								$.append($$anchor, text_16);
							},
							$$slots: { description: true, icon: true, default: true }
						});
					}

					var node_20 = $.sibling(node_17, 2);

					Content(node_20, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('The content for panel 4.');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}