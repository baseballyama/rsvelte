import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Announcement from "$lib/components/announcement.svelte";
import BlocksNav from "$lib/components/blocks-nav.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import PageNav from "$lib/components/page-nav.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <div class="container-wrapper flex-1 section-soft md:py-12"><div class="container"><!></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	const title = "Building Blocks for the Web";
	const description = "Clean, modern building blocks. Works with all Svelte projects. Copy and paste into your apps. Open Source. Free forever.";
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
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Announcement(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			PageHeaderHeading(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					text.nodeValue = 'Building Blocks for the Web';
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			PageHeaderDescription(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'Clean, modern building blocks. Works with all Svelte projects. Copy and paste into your apps. Open Source. Free forever.';
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			PageActions(node_5, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						href: '#blocks',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Browse Blocks');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_1, 2);

	PageNav(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_1();
			var node_7 = $.first_child(fragment_5);

			BlocksNav(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				size: 'sm',
				variant: 'secondary',
				href: '/blocks/sidebar',
				class: 'me-7 hidden shadow-none lg:flex',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Browse all blocks');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_6, 2);
	var div_1 = $.child(div);
	var node_9 = $.child(div_1);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
}