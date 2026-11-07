import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, Paragraph, Strong, Table, Thead, Tbody, Tr, Th, Td, Link } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";

var root = $.from_html(`Svelte Shadcn Blocks ships production-ready UI blocks built with <!>, Shadcn-Svelte and Tailwind CSS`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

var root_3 = $.from_html(
	`Start with <!> and continue with the theme
			setup that matches your project.`,
	1
);

var root_4 = $.from_html(`<section><!> <!></section> <section class="space-y-4"><!> <!></section> <section><!> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const pageMeta = docsV2PageMap.introduction;
	var fragment = root_2();
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
		title: 'Introduction',
		description: 'Everything you need to start using Svelte Shadcn Blocks.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var section = $.first_child(fragment_1);
			var node_2 = $.child(section);

			H2(node_2, {
				id: 'overview',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Overview');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Paragraph(node_3, {
				class: 'mt-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_4 = $.sibling($.first_child(fragment_2));

					Strong(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Svelte 5');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var node_5 = $.child(section_1);

			H2(node_5, {
				id: 'variants',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Available Variants');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Table(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_7 = $.first_child(fragment_3);

					Thead(node_7, {
						children: ($$anchor, $$slotProps) => {
							Tr($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_8 = $.first_child(fragment_5);

									Th(node_8, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Variant');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Th(node_9, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Style');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Th(node_10, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Best For');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_7, 2);

					Tbody(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_12 = $.first_child(fragment_6);

							Tr(node_12, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_13 = $.first_child(fragment_7);

									Td(node_13, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Normal');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									Td(node_14, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Bold marketing visuals');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									Td(node_15, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Landing pages and campaigns');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_12, 2);

							Tr(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_17 = $.first_child(fragment_8);

									Td(node_17, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Mist');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Td(node_18, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Minimal and documentation friendly');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Td(node_19, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Content-heavy product websites');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_16, 2);

							Tr(node_20, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_21 = $.first_child(fragment_9);

									Td(node_21, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Veil');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									var node_22 = $.sibling(node_21, 2);

									Td(node_22, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text('Polished modern SaaS look');

											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});

									var node_23 = $.sibling(node_22, 2);

									Td(node_23, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('Startup and product pages');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(section_1);

			var section_2 = $.sibling(section_1, 2);
			var node_24 = $.child(section_2);

			H2(node_24, {
				id: 'quick-start',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Quick Start');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_24, 2);

			Paragraph(node_25, {
				class: 'mt-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_10 = root_3();
					var node_26 = $.sibling($.first_child(fragment_10));

					Link(node_26, {
						href: '/v2-docs/installation',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Installation');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(section_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}