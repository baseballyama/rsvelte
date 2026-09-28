import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import MenuIcon from '@lucide/svelte/icons/menu';
import SearchIcon from '@lucide/svelte/icons/search';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><!></button>`);
var root_1 = $.from_html(`<p class="text-2xl">Headline</p>`);
var root_2 = $.from_html(`<button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<p>Headline</p>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<h2 class="h2">Headline</h2>`);
var root_7 = $.from_html(`<div class="space-y-10"><header><h2 class="h2">App Bar</h2></header> <section class="space-y-4"><!></section> <section class="space-y-4"><h3 class="h3">Centered</h3> <!></section> <section class="space-y-4"><h3 class="h3">Extended</h3> <!></section></div>`);

export default function _page($$anchor) {
	var div = root_7();
	var section = $.sibling($.child(div), 2);
	var node = $.child(section);

	AppBar(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar) => {
				AppBar_Toolbar($$anchor, {
					class: 'grid-cols-[auto_1fr_auto]',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_3();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => AppBar.Lead, ($$anchor, AppBar_Lead) => {
							AppBar_Lead($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var button = root();
									var node_3 = $.child(button);

									MenuIcon(node_3, {});
									$.reset(button);
									$.append($$anchor, button);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => AppBar.Headline, ($$anchor, AppBar_Headline) => {
							AppBar_Headline($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var p = root_1();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => AppBar.Trail, ($$anchor, AppBar_Trail) => {
							AppBar_Trail($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_2();
									var button_1 = $.first_child(fragment_2);
									var node_6 = $.child(button_1);

									SearchIcon(node_6, { class: 'size-6' });
									$.reset(button_1);

									var button_2 = $.sibling(button_1, 2);
									var node_7 = $.child(button_2);

									CalendarIcon(node_7, { class: 'size-6' });
									$.reset(button_2);

									var button_3 = $.sibling(button_2, 2);
									var node_8 = $.child(button_3);

									CircleUserIcon(node_8, { class: 'size-6' });
									$.reset(button_3);
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_9 = $.sibling($.child(section_1), 2);

	AppBar(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_10 = $.first_child(fragment_3);

			$.component(node_10, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar_1) => {
				AppBar_Toolbar_1($$anchor, {
					class: 'grid-cols-[1fr_2fr_1fr]',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_3();
						var node_11 = $.first_child(fragment_4);

						$.component(node_11, () => AppBar.Lead, ($$anchor, AppBar_Lead_1) => {
							AppBar_Lead_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var button_4 = root();
									var node_12 = $.child(button_4);

									MenuIcon(node_12, {});
									$.reset(button_4);
									$.append($$anchor, button_4);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_11, 2);

						$.component(node_13, () => AppBar.Headline, ($$anchor, AppBar_Headline_1) => {
							AppBar_Headline_1($$anchor, {
								class: 'flex justify-center',
								children: ($$anchor, $$slotProps) => {
									var p_1 = root_4();

									$.append($$anchor, p_1);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => AppBar.Trail, ($$anchor, AppBar_Trail_1) => {
							AppBar_Trail_1($$anchor, {
								class: 'justify-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var button_5 = $.first_child(fragment_5);
									var node_15 = $.child(button_5);

									SearchIcon(node_15, { class: 'size-6' });
									$.reset(button_5);

									var button_6 = $.sibling(button_5, 2);
									var node_16 = $.child(button_6);

									CalendarIcon(node_16, { class: 'size-6' });
									$.reset(button_6);

									var button_7 = $.sibling(button_6, 2);
									var node_17 = $.child(button_7);

									CircleUserIcon(node_17, { class: 'size-6' });
									$.reset(button_7);
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_18 = $.sibling($.child(section_2), 2);

	AppBar(node_18, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_5();
			var node_19 = $.first_child(fragment_6);

			$.component(node_19, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar_2) => {
				AppBar_Toolbar_2($$anchor, {
					class: 'grid-cols-[auto_auto]',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_5();
						var node_20 = $.first_child(fragment_7);

						$.component(node_20, () => AppBar.Lead, ($$anchor, AppBar_Lead_2) => {
							AppBar_Lead_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var button_8 = root();
									var node_21 = $.child(button_8);

									MenuIcon(node_21, {});
									$.reset(button_8);
									$.append($$anchor, button_8);
								},
								$$slots: { default: true }
							});
						});

						var node_22 = $.sibling(node_20, 2);

						$.component(node_22, () => AppBar.Trail, ($$anchor, AppBar_Trail_2) => {
							AppBar_Trail_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var button_9 = $.first_child(fragment_8);
									var node_23 = $.child(button_9);

									SearchIcon(node_23, { class: 'size-6' });
									$.reset(button_9);

									var button_10 = $.sibling(button_9, 2);
									var node_24 = $.child(button_10);

									CalendarIcon(node_24, { class: 'size-6' });
									$.reset(button_10);

									var button_11 = $.sibling(button_10, 2);
									var node_25 = $.child(button_11);

									CircleUserIcon(node_25, { class: 'size-6' });
									$.reset(button_11);
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_26 = $.sibling(node_19, 2);

			$.component(node_26, () => AppBar.Headline, ($$anchor, AppBar_Headline_2) => {
				AppBar_Headline_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var h2 = root_6();

						$.append($$anchor, h2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, div);
}