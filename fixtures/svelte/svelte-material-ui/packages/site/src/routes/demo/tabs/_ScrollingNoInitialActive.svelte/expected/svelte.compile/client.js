import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<div><!></div>`);

export default function _ScrollingNoInitialActive($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			Tab($$anchor, {
				get tab() {
					return tab();
				},

				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `Tab ${tab() ?? ''}`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => [...Array(20)].map((_v, i) => i + 1));

		TabBar(node, {
			get tabs() {
				return $.get($0);
			},
			tab,
			$$slots: { tab: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}