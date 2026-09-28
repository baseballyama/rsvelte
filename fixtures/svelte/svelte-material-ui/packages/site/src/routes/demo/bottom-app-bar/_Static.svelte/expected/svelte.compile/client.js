import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BottomAppBar, { Section } from '@smui-extra/bottom-app-bar';
import IconButton, { Icon } from '@smui/icon-button';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div> <div class="flexy svelte-1j1goll"><div class="bottom-app-bar-container flexor svelte-1j1goll"><div class="flexor-content svelte-1j1goll"><h5>Flex Static</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> <!></div> <div class="bottom-app-bar-container svelte-1j1goll"><div><h5>Static</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> <!></div></div>`, 1);

export default function _Static($$anchor) {
	let secondaryColor = $.state(false);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Secondary');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(secondaryColor);
					},

					set checked($$value) {
						$.set(secondaryColor, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node_1 = $.sibling($.child(div_3), 2);

	LoremIpsum(node_1, {});
	$.next(2);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		let $0 = $.derived(() => $.get(secondaryColor) ? 'secondary' : 'primary');

		BottomAppBar(node_2, {
			variant: 'static',
			get color() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				Section(node_3, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('menu');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Section(node_4, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_5 = $.first_child(fragment_5);

						IconButton(node_5, {
							'aria-label': 'Search',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('search');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						IconButton(node_6, {
							'aria-label': 'More',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('more_vert');

										$.append($$anchor, text_3);
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

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_7 = $.sibling($.child(div_5), 2);

	LoremIpsum(node_7, {});
	$.next(2);
	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	{
		let $0 = $.derived(() => $.get(secondaryColor) ? 'secondary' : 'primary');

		BottomAppBar(node_8, {
			variant: 'static',
			get color() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root();
				var node_9 = $.first_child(fragment_8);

				Section(node_9, {
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

				var node_10 = $.sibling(node_9, 2);

				Section(node_10, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root();
						var node_11 = $.first_child(fragment_11);

						IconButton(node_11, {
							'aria-label': 'Search',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('search');

										$.append($$anchor, text_5);
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

										var text_6 = $.text('more_vert');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.reset(div_1);
	$.append($$anchor, fragment);
}