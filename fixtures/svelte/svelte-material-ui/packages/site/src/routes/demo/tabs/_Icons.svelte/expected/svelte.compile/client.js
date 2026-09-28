import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Icon, Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function _Icons($$anchor) {
	let tabs = [
		{ icon: 'access_time', label: 'Recents' },
		{ icon: 'near_me', label: 'Nearby' },
		{ icon: 'favorite', label: 'Favorites' }
	];

	let active = $.state($.proxy(tabs[0]));
	var div = root_1();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			Tab($$anchor, {
				get tab() {
					return tab();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Icon(node_1, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, tab().icon));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Label(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, tab().label));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		TabBar(node, {
			get tabs() {
				return tabs;
			},
			key: (tab) => tab.label,
			get active() {
				return $.get(active);
			},

			set active($$value) {
				$.set(active, $$value, true);
			},
			tab,
			$$slots: { tab: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}