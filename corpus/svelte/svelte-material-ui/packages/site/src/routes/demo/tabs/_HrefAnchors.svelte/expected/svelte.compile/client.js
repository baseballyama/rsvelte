import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<div><!> <iframe src="https://en.wikipedia.org/wiki/Home" title="Selected Tab" name="href-tabs-frame" style="width: 100%; height: 400px; border: 0;" role="tabpanel"></iframe></div>`);

export default function _HrefAnchors($$anchor) {
	let active = $.state('Home');
	var div = root();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			{
				let $0 = $.derived(() => tab().replace(/ /g, '_'));

				Tab($$anchor, {
					get tab() {
						return tab();
					},

					get href() {
						return `https://en.wikipedia.org/wiki/${$.get($0) ?? ''}`;
					},
					target: 'href-tabs-frame',
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
			}
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

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}