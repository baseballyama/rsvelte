import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card, { Content, PrimaryAction, Actions, ActionButtons, ActionIcons } from '@smui/card';
import Button, { Label } from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <i class="material-icons" aria-hidden="true">arrow_forward</i>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="card-display"><div class="card-container"><!></div> <div class="card-container"><!></div> <div class="card-container"><!></div> <div class="card-container"><!></div> <div class="card-container"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _Actions($$anchor) {
	let clicked = $.state(0);
	var fragment = root_3();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		children: ($$anchor, $$slotProps) => {
			PrimaryAction($$anchor, {
				onclick: () => $.update(clicked),
				padded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Primary Action, a clickable area of the card.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Card(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			Content(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('A card with action buttons.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Actions(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Button(node_4, {
						onclick: () => $.update(clicked),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Action');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						onclick: () => $.update(clicked),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Another');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	Card(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_7 = $.first_child(fragment_6);

			Content(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('A card with a full-bleed action.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Actions(node_8, {
				fullBleed: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						onclick: () => $.update(clicked),
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_1();
							var node_9 = $.first_child(fragment_8);

							Label(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Action');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.next(2);
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_10 = $.child(div_4);

	Card(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_11 = $.first_child(fragment_9);

			Content(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('A card with action icons.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Actions(node_12, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_2();
					var node_13 = $.first_child(fragment_10);

					IconButton(node_13, {
						onclick: () => $.update(clicked),
						toggle: true,
						'aria-label': 'Add to favorites',
						title: 'Add to favorites',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_14 = $.first_child(fragment_11);

							Icon(node_14, {
								class: 'material-icons',
								on: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('favorite');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Icon(node_15, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('favorite_border');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_13, 2);

					IconButton(node_16, {
						onclick: () => $.update(clicked),
						title: 'Share',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('share');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					IconButton(node_17, {
						onclick: () => $.update(clicked),
						title: 'More options',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								class: 'material-icons',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('more_vert');

									$.append($$anchor, text_10);
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

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_18 = $.child(div_5);

	Card(node_18, {
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root();
			var node_19 = $.first_child(fragment_14);

			Content(node_19, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('A card with Both.');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Actions(node_20, {
				children: ($$anchor, $$slotProps) => {
					var fragment_15 = root();
					var node_21 = $.first_child(fragment_15);

					ActionButtons(node_21, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root();
							var node_22 = $.first_child(fragment_16);

							Button(node_22, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Action');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							Button(node_23, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text('Another');

											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_21, 2);

					ActionIcons(node_24, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_2();
							var node_25 = $.first_child(fragment_19);

							IconButton(node_25, {
								onclick: () => $.update(clicked),
								toggle: true,
								'aria-label': 'Add to favorites',
								title: 'Add to favorites',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root();
									var node_26 = $.first_child(fragment_20);

									Icon(node_26, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('favorite');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_27 = $.sibling(node_26, 2);

									Icon(node_27, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('favorite_border');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_25, 2);

							IconButton(node_28, {
								onclick: () => $.update(clicked),
								title: 'Share',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('share');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							IconButton(node_29, {
								onclick: () => $.update(clicked),
								title: 'More options',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('more_vert');

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_18 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_18, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}