import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<div class="icon-indicators svelte-1k7u355"><!></div>`);

export default function _IconIndicators($$anchor) {
	let active = $.state('Home');
	var div = root();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			{
				const tabIndicator = ($$anchor) => {
					$.next();

					var text = $.text('star');

					$.append($$anchor, text);
				};

				Tab($$anchor, {
					get tab() {
						return tab();
					},
					tabIndicator$type: 'icon',
					tabIndicator$content$class: 'material-icons',
					tabIndicator,
					children: ($$anchor, $$slotProps) => {
						Label($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, tab()));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { tabIndicator: true, default: true }
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

	$.reset(div);
	$.append($$anchor, div);
}