import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BottomAppBar, { Section, AutoAdjust } from '@smui-extra/bottom-app-bar';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h5>Standard</h5> <div><!></div> <!> <!> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	let bottomAppBar = $.state(null);
	let snackbar = $.state(void 0);
	let withFab = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	AutoAdjust(node, {
		get bottomAppBar() {
			return $.get(bottomAppBar);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.sibling($.first_child(fragment_1), 2);
			var node_1 = $.child(div);

			{
				const label = ($$anchor) => {
					$.next();

					var text = $.text('With FAB');

					$.append($$anchor, text);
				};

				FormField(node_1, {
					label,
					children: ($$anchor, $$slotProps) => {
						Checkbox($$anchor, {
							get checked() {
								return $.get(withFab);
							},

							set checked($$value) {
								$.set(withFab, $$value, true);
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$.reset(div);

			var node_2 = $.sibling(div, 2);

			Button(node_2, {
				onclick: () => $.get(snackbar)?.open(),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Open Snackbar');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			$.bind_this(
				Snackbar(node_3, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_4 = $.first_child(fragment_4);

						Label(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('This is a snackbar.');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Actions(node_5, {
							children: ($$anchor, $$slotProps) => {
								IconButton($$anchor, {
									title: 'Dismiss',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('close');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(snackbar, $$value, true),
				() => $.get(snackbar)
			);

			var node_6 = $.sibling(node_3, 2);

			LoremIpsum(node_6, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	$.bind_this(
		BottomAppBar(node_7, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_2();
				var node_8 = $.first_child(fragment_7);

				Section(node_8, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('menu');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				{
					var consequent = ($$anchor) => {
						Section($$anchor, {
							fabInset: true,
							children: ($$anchor, $$slotProps) => {
								Fab($$anchor, {
									'aria-label': 'New item',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											class: 'material-icons',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('add');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					};

					$.if(node_9, ($$render) => {
						if ($.get(withFab)) $$render(consequent);
					});
				}

				var node_10 = $.sibling(node_9, 2);

				Section(node_10, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root();
						var node_11 = $.first_child(fragment_13);

						IconButton(node_11, {
							'aria-label': 'Search',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('search');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_12 = $.sibling(node_11, 2);

						IconButton(node_12, {
							'aria-label': 'More',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('more_vert');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		}),
		($$value) => $.set(bottomAppBar, $$value, true),
		() => $.get(bottomAppBar)
	);

	$.append($$anchor, fragment);
}