import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import Card, {
	Content,
	PrimaryAction,
	Media,
	MediaContent,
	Actions,
	ActionButtons,
	ActionIcons
} from '@smui/card';

import Button, { Label } from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<div style="color: #fff; position: absolute; bottom: 16px; left: 16px;" class="svelte-36ac50"><h2 class="mdc-typography--headline6 svelte-36ac50" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-36ac50" style="margin: 0;">And a subtitle.</h3></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<h2 class="mdc-typography--headline6 svelte-36ac50" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-36ac50" style="margin: 0 0 10px; color: #888;">And a subtitle.</h3> And higher elevation. It's all in this card. It's a veritable smorgasbord
          of card features.`,
	1
);

var root_4 = $.from_html(`<div class="card-display svelte-36ac50"><div class="card-container svelte-36ac50"><!></div> <div class="card-container svelte-36ac50"><!></div></div> <pre class="status svelte-36ac50"> </pre>`, 1);

export default function _Complex($$anchor) {
	let clicked = $.state(0);
	var fragment = root_4();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		class: 'mdc-elevation--z12',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			PrimaryAction(node_1, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					Media(node_2, {
						class: 'card-media-16x9',
						aspectRatio: '16x9',
						children: ($$anchor, $$slotProps) => {
							MediaContent($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_2 = root();

									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Content(node_3, {
						class: 'mdc-typography--body2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('And higher elevation. It\'s all in this card. It\'s a veritable\n          smorgasbord of card features.');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Actions(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_5 = $.first_child(fragment_4);

					ActionButtons(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_6 = $.first_child(fragment_5);

							Button(node_6, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Action');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Another');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_5, 2);

					ActionIcons(node_8, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_2();
							var node_9 = $.first_child(fragment_8);

							IconButton(node_9, {
								onclick: () => $.update(clicked),
								toggle: true,
								'aria-label': 'Add to favorites',
								title: 'Add to favorites',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_10 = $.first_child(fragment_9);

									Icon(node_10, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('favorite');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									Icon(node_11, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('favorite_border');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_9, 2);

							IconButton(node_12, {
								onclick: () => $.update(clicked),
								title: 'Share',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('share');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							IconButton(node_13, {
								onclick: () => $.update(clicked),
								title: 'More options',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('more_vert');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_14 = $.child(div_3);

	Card(node_14, {
		class: 'mdc-elevation--z12',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_1();
			var node_15 = $.first_child(fragment_12);

			PrimaryAction(node_15, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_1();
					var node_16 = $.first_child(fragment_13);

					Media(node_16, { class: 'card-media-16x9', aspectRatio: '16x9' });

					var node_17 = $.sibling(node_16, 2);

					Content(node_17, {
						class: 'mdc-typography--body2',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_3();

							$.next(3);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_15, 2);

			Actions(node_18, {
				children: ($$anchor, $$slotProps) => {
					var fragment_15 = root_1();
					var node_19 = $.first_child(fragment_15);

					ActionButtons(node_19, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_20 = $.first_child(fragment_16);

							Button(node_20, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Action');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							Button(node_21, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Another');

											$.append($$anchor, text_8);
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

					var node_22 = $.sibling(node_19, 2);

					ActionIcons(node_22, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_2();
							var node_23 = $.first_child(fragment_19);

							IconButton(node_23, {
								onclick: () => $.update(clicked),
								toggle: true,
								'aria-label': 'Add to favorites',
								title: 'Add to favorites',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_1();
									var node_24 = $.first_child(fragment_20);

									Icon(node_24, {
										class: 'material-icons',
										on: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('favorite');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_25 = $.sibling(node_24, 2);

									Icon(node_25, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('favorite_border');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});

							var node_26 = $.sibling(node_23, 2);

							IconButton(node_26, {
								onclick: () => $.update(clicked),
								title: 'Share',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('share');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							IconButton(node_27, {
								onclick: () => $.update(clicked),
								title: 'More options',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('more_vert');

											$.append($$anchor, text_12);
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

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_13 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_13, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}