import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Announcement from "$lib/components/announcement.svelte";
import ChartsNav from "$lib/components/charts-nav.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import PageNav from "$lib/components/page-nav.svelte";
import ThemeSelector from "$lib/components/theme-selector.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <div class="container-wrapper flex-1 section-soft"><div class="container pb-6"><section class="theme-container"><!></section></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	const title = "Beautiful Charts & Graphs";
	const description = "A collection of ready-to-use chart components built with LayerChart. From basic charts to rich data displays, copy and paste into your apps.";
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}));

		Metadata(node, {
			title,
			description,
			get ogImage() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	PageHeader(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Announcement(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			PageHeaderHeading(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					text.nodeValue = 'Beautiful Charts & Graphs';
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			PageHeaderDescription(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'A collection of ready-to-use chart components built with LayerChart. From basic charts to rich data displays, copy and paste into your apps.';
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			PageActions(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_6 = $.first_child(fragment_4);

					Button(node_6, {
						href: '#charts',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Browse Charts');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						href: '/docs/components/chart',
						variant: 'ghost',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Documentation');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_1, 2);

	PageNav(node_8, {
		id: 'charts',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_9 = $.first_child(fragment_5);

			ChartsNav(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ThemeSelector(node_10, { class: 'me-4 hidden md:flex' });
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_8, 2);
	var div_1 = $.child(div);
	var section = $.child(div_1);
	var node_11 = $.child(section);

	$.snippet(node_11, () => $$props.children ?? $.noop);
	$.reset(section);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
}