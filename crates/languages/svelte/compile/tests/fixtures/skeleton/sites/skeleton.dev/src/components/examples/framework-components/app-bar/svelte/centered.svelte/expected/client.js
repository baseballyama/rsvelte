import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import MenuIcon from '@lucide/svelte/icons/menu';
import SearchIcon from '@lucide/svelte/icons/search';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><!></button>`);
var root_1 = $.from_html(`<p>Headline</p>`);
var root_2 = $.from_html(`<button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Centered($$anchor) {
	AppBar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar) => {
				AppBar_Toolbar($$anchor, {
					class: 'grid-cols-[1fr_2fr_1fr]',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => AppBar.Lead, ($$anchor, AppBar_Lead) => {
							AppBar_Lead($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var button = root();
									var node_2 = $.child(button);

									MenuIcon(node_2, {});
									$.reset(button);
									$.append($$anchor, button);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => AppBar.Headline, ($$anchor, AppBar_Headline) => {
							AppBar_Headline($$anchor, {
								class: 'flex justify-center',
								children: ($$anchor, $$slotProps) => {
									var p = root_1();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => AppBar.Trail, ($$anchor, AppBar_Trail) => {
							AppBar_Trail($$anchor, {
								class: 'justify-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var button_1 = $.first_child(fragment_3);
									var node_5 = $.child(button_1);

									SearchIcon(node_5, { class: 'size-6' });
									$.reset(button_1);

									var button_2 = $.sibling(button_1, 2);
									var node_6 = $.child(button_2);

									CalendarIcon(node_6, { class: 'size-6' });
									$.reset(button_2);

									var button_3 = $.sibling(button_2, 2);
									var node_7 = $.child(button_3);

									CircleUserIcon(node_7, { class: 'size-6' });
									$.reset(button_3);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}