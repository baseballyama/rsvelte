import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<div><!></div>`);

export default function _MinWidth($$anchor) {
	let active = $.state('Home');
	var div = root();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			Tab($$anchor, {
				get tab() {
					return tab();
				},
				minWidth: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, tab()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		TabBar(node, {
			tabs: ['Home', 'Merchandise', 'About Us'],
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