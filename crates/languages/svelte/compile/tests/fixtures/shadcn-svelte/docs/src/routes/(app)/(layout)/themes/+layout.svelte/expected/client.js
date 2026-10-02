import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Announcement from "$lib/components/announcement.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div><!> <!></div>`, 1);

export default function _layout($$anchor, $$props) {
	const title = "Pick a Color. Make it yours.";
	const description = "Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon.";
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

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

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

					text.nodeValue = 'Pick a Color. Make it yours.';
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			PageHeaderDescription(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon.';
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
						href: '#themes',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Browse Themes');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						href: '/docs/theming',
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

	$.snippet(node_8, () => $$props.children);
	$.reset(div);
	$.append($$anchor, fragment);
}