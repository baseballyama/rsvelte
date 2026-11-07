import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BottomAppBar, { Section } from '@smui-extra/bottom-app-bar';
import IconButton from '@smui/icon-button';
import Fab, { Icon } from '@smui/fab';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div> <div class="flexy svelte-idqu90"><div class="bottom-app-bar-container flexor svelte-idqu90"><div class="flexor-content svelte-idqu90"><h5>Centered FAB</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> <!></div> <div class="bottom-app-bar-container flexor svelte-idqu90"><div class="flexor-content svelte-idqu90"><h5>Right FAB</h5> <!> <img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div> <!></div></div>`, 1);

export default function _Fab($$anchor) {
	let secondaryColor = $.state(false);
	var fragment = root_3();
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
				var fragment_2 = root_1();
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
						{
							let $0 = $.derived(() => $.get(secondaryColor) ? 'primary' : 'secondary');

							Fab($$anchor, {
								'aria-label': 'New item',
								get color() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('add');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Section(node_5, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_6 = $.first_child(fragment_7);

						IconButton(node_6, {
							'aria-label': 'Search',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('search');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						IconButton(node_7, {
							'aria-label': 'More',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('more_vert');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_7);
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
	var node_8 = $.sibling($.child(div_5), 2);

	LoremIpsum(node_8, {});
	$.next(2);
	$.reset(div_5);

	var node_9 = $.sibling(div_5, 2);

	{
		let $0 = $.derived(() => $.get(secondaryColor) ? 'secondary' : 'primary');

		BottomAppBar(node_9, {
			variant: 'static',
			get color() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root();
				var node_10 = $.first_child(fragment_10);

				Section(node_10, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_2();
						var node_11 = $.first_child(fragment_11);

						IconButton(node_11, {
							'aria-label': 'Archive',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('archive');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_12 = $.sibling(node_11, 2);

						IconButton(node_12, {
							'aria-label': 'Mark unread',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('mail');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_12, 2);

						IconButton(node_13, {
							'aria-label': 'Label',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('label');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_13, 2);

						IconButton(node_14, {
							'aria-label': 'Trash',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text('delete');

										$.append($$anchor, text_8);
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

				var node_15 = $.sibling(node_10, 2);

				Section(node_15, {
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(secondaryColor) ? 'primary' : 'secondary');

							Fab($$anchor, {
								'aria-label': 'Reply',
								get color() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('reply');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.reset(div_1);
	$.append($$anchor, fragment);
}