import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Content,
	FormGroup,
	Header,
	HeaderSearch,
	HeaderUtilities,
	RadioButton,
	RadioButtonGroup,
	SearchMenuGroup,
	SearchMenuItem,
	SkipToContent
} from "carbon-components-svelte";

import Document from "carbon-icons-svelte/lib/Document.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

var root = $.from_html(` <strong>Docs</strong>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<h1>HeaderSearch (menu slot)</h1> <p>Open search and type a component name (e.g. "data"). Results fuzzy-match and
    highlight, grouped under a header, with a persistent footer action.</p> <!> <pre> </pre>`,
	1
);

export default function HeaderSearchMenu($$anchor) {
	const docs = [
		{
			id: "accordion",
			text: "Accordion",
			href: "/components/Accordion"
		},
		{ id: "button", text: "Button", href: "/components/Button" },
		{
			id: "data-table",
			text: "DataTable",
			href: "/components/DataTable"
		},

		{
			id: "dropdown",
			text: "Dropdown",
			href: "/components/Dropdown"
		},

		{
			id: "search-menu",
			text: "SearchMenu",
			href: "/components/SearchMenu"
		},

		{
			id: "header-search",
			text: "HeaderSearch",
			href: "/components/UIShell"
		}
	];

	let value = "";
	let active = false;
	let size = "sm";
	let events = [];
	var fragment = root_1();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'Carbon',
		platformName: 'Svelte',
		children: ($$anchor, $$slotProps) => {
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					HeaderSearch($$anchor, {
						get size() {
							return size;
						},
						placeholder: 'Search...',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
						},

						get active() {
							return active;
						},

						set active($$value) {
							active = $$value;
						},

						$$events: {
							select: (e) => events = [{ type: "select", ...e.detail }, ...events],
							submit: (e) => events = [{ type: "submit", ...e.detail }, ...events],
							close: (e) => events = [{ type: "close", ...e.detail }, ...events]
						},
						$$slots: {
							menu: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								SearchMenuGroup(node_1, {
									label: 'Docs',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_2 = $.first_child(fragment_4);

										$.each(node_2, 17, () => docs, (doc) => doc.id, ($$anchor, doc) => {
											SearchMenuItem($$anchor, {
												get text() {
													return $.get(doc).text;
												},

												get href() {
													return $.get(doc).href;
												},

												get icon() {
													return Document;
												}
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_3 = $.sibling(node_1, 2);

								SearchMenuGroup(node_3, {
									divider: true,
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => encodeURIComponent(value));

											SearchMenuItem($$anchor, {
												persistent: true,
												get iconRight() {
													return Launch;
												},

												get href() {
													return `https://www.google.com/search?q=${$.get($0) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_7 = root();
													var text = $.first_child(fragment_7);

													$.next();
													$.template_effect(() => $.set_text(text, `Search "${value ?? ''}" in `));
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},

							noResults: ($$anchor, $$slotProps) => {
								var text_1 = $.text('No matching components');

								$.append($$anchor, text_1);
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Content(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_3();
			var node_5 = $.sibling($.first_child(fragment_9), 4);

			FormGroup(node_5, {
				legendText: 'Menu size',
				children: ($$anchor, $$slotProps) => {
					RadioButtonGroup($$anchor, {
						get selected() {
							return size;
						},

						set selected($$value) {
							size = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_2();
							var node_6 = $.first_child(fragment_11);

							RadioButton(node_6, { value: 'sm', labelText: 'Small' });

							var node_7 = $.sibling(node_6, 2);

							RadioButton(node_7, { value: 'lg', labelText: 'Large' });

							var node_8 = $.sibling(node_7, 2);

							RadioButton(node_8, { value: 'xl', labelText: 'Extra large' });
							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var pre = $.sibling(node_5, 2);
			var text_2 = $.only_child(pre, true);

			$.template_effect(($0) => $.set_text(text_2, $0), [() => JSON.stringify(events.slice(0, 5), null, 2)]);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}