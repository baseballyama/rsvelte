import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Pane, TabGroup, TabPage } from '$lib';

var root = $.from_html(`<p> </p> <!>`, 1);

export default function TestTabsSort($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let tabIndex = 0;

	let tabPages = ['A', 'B', 'C', 'D'];

	function sortTabs() {
		tabPages = tabPages.toReversed();
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	Pane(node, {
		position: 'inline',
		children: ($$anchor, $$slotProps) => {
			TabGroup($$anchor, {
				get selectedIndex() {
					return tabIndex;
				},

				set selectedIndex($$value) {
					tabIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => tabPages, $.index, ($$anchor, pageTitle) => {
						TabPage($$anchor, {
							get title() {
								return $.get(pageTitle);
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, { title: 'Sort Tabs', $$events: { click: sortTabs } });
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_text(text, `TabIndex: ${tabIndex ?? ''}`));
	$.append($$anchor, fragment);
}