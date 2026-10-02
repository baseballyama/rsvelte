import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Announcement from "$lib/components/announcement.svelte";
import ExamplesNav from "$lib/components/examples-nav.svelte";
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
var root_2 = $.from_html(`<!> <!> <!> <div class="container-wrapper flex flex-1 flex-col section-soft pb-6"><div class="container flex flex-1 scroll-mt-20 flex-col theme-container"><div class="flex flex-col overflow-hidden rounded-lg border bg-background bg-clip-padding md:flex-1 xl:rounded-xl"><!></div></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	const title = "Examples";
	const description = "Check out some example apps build using the components.";
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

					var text = $.text('The Foundation for your Design System');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			PageHeaderDescription(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('A set of beautifully designed components that you can customize, extend, and build on. Start\n		here then make it your own. Open Source. Open Code.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			PageActions(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					Button(node_6, {
						href: '/docs',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Get Started');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						href: '/blocks',
						size: 'sm',
						variant: 'ghost',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Browse Blocks');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_1, 2);

	PageNav(node_8, {
		id: 'examples',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_9 = $.first_child(fragment_3);

			ExamplesNav(node_9, {
				class: 'flex-1 overflow-hidden [&>a:first-child]:text-primary'
			});

			var node_10 = $.sibling(node_9, 2);

			ThemeSelector(node_10, { class: 'me-4 hidden md:block' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_8, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_11 = $.child(div_2);

	$.snippet(node_11, () => $$props.children);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
}