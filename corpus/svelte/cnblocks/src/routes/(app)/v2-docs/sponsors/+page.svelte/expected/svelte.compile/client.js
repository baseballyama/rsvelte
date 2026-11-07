import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, H3, Paragraph, Link, UnorderedList, ListItem } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center rounded-xl border bg-card p-3"><img class="size-24 rounded-full border object-cover" loading="lazy"/> <span class="mt-2 text-center text-sm font-medium"> </span></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<section><!> <div class="mt-2 grid grid-cols-2 gap-4 md:grid-cols-5"></div></section> <section><!> <!> <div class="mt-6 flex flex-wrap gap-3"><!> <!></div></section>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const pageMeta = docsV2PageMap.sponsors;

	const sponsors = [
		{
			name: "Hunter Johnston",
			avatar: "https://github.com/huntabyte.png",
			href: "https://github.com/huntabyte"
		},

		{
			name: "Yashash Pugalia",
			avatar: "https://avatars.githubusercontent.com/u/89068816?v=4",
			href: "https://github.com/yashash-pugalia"
		},

		{
			name: "Ever",
			avatar: "https://avatars.githubusercontent.com/u/29817086?v=4",
			href: "https://github.com/ruizdiazever"
		}
	];

	var fragment = root_3();
	var node = $.first_child(fragment);

	SEOComponent(node, {
		get title() {
			return pageMeta.seo.title;
		},

		get description() {
			return pageMeta.seo.description;
		},

		get keywords() {
			return pageMeta.seo.keywords;
		}
	});

	var node_1 = $.sibling(node, 2);

	DocsPageShell(node_1, {
		title: 'Sponsors',
		description: 'Support development of Svelte Shadcn Blocks and help keep the project sustainable.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var section = $.first_child(fragment_1);
			var node_2 = $.child(section);

			H2(node_2, {
				id: 'current-sponsors',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Current Sponsors');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_2, 2);

			$.each(div, 21, () => sponsors, $.index, ($$anchor, sponsor) => {
				var a = root();
				var img = $.child(a);
				var span = $.sibling(img, 2);
				var text_1 = $.only_child(span, true);

				$.reset(a);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(sponsor).href);
					$.set_attribute(img, 'src', $.get(sponsor).avatar);
					$.set_attribute(img, 'alt', $.get(sponsor).name);
					$.set_text(text_1, $.get(sponsor).name);
				});

				$.append($$anchor, a);
			});

			$.reset(div);
			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var node_3 = $.child(section_1);

			H2(node_3, {
				id: 'how-to-support',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('How To Support');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			UnorderedList(node_4, {
				class: 'mt-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_5 = $.first_child(fragment_2);

					ListItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Become a recurring sponsor on GitHub.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					ListItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Share the project with your developer network.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					ListItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Contribute docs, bug fixes, and component improvements.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_4, 2);
			var node_8 = $.child(div_1);

			Button(node_8, {
				href: 'https://github.com/sponsors/SikandarJODD',
				target: '_blank',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Donate on GitHub');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				variant: 'outline',
				target: '_blank',
				href: 'https://twitter.com/intent/tweet?text=I%E2%80%99m%20using%20Svelte%20Shadcn%20Blocks%20for%20my%20marketing%20pages.%20Check%20it%20out%20https%3A%2F%2Fsv-blocks.vercel.app',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Share on Twitter');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(section_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}