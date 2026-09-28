import * as $ from 'svelte/internal/server';

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

export default function HeaderSearchMenu($$renderer) {
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
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'Carbon',
			platformName: 'Svelte',
			children: ($$renderer) => {
				HeaderUtilities($$renderer, {
					children: ($$renderer) => {
						HeaderSearch($$renderer, {
							size,
							placeholder: 'Search...',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							get active() {
								return active;
							},

							set active($$value) {
								active = $$value;
								$$settled = false;
							},

							$$slots: {
								menu: ($$renderer) => {
									{
										SearchMenuGroup($$renderer, {
											label: 'Docs',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(docs);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let doc = each_array[$$index];

													SearchMenuItem($$renderer, { text: doc.text, href: doc.href, icon: Document });
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SearchMenuGroup($$renderer, {
											divider: true,
											children: ($$renderer) => {
												SearchMenuItem($$renderer, {
													persistent: true,
													iconRight: Launch,
													href: `https://www.google.com/search?q=${$.stringify(encodeURIComponent(value))}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Search "${$.escape(value)}" in <strong>Docs</strong>`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									}
								},

								noResults: ($$renderer) => {
									{
										$$renderer.push(`No matching components`);
									}
								}
							}
						});
					},
					$$slots: { default: true }
				});
			},

			$$slots: {
				default: true,
				skipToContent: ($$renderer) => {
					{
						SkipToContent($$renderer, {});
					}
				}
			}
		});

		$$renderer.push(`<!----> `);

		Content($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<h1>HeaderSearch (menu slot)</h1> <p>Open search and type a component name (e.g. "data"). Results fuzzy-match and
    highlight, grouped under a header, with a persistent footer action.</p> `);

				FormGroup($$renderer, {
					legendText: 'Menu size',
					children: ($$renderer) => {
						RadioButtonGroup($$renderer, {
							get selected() {
								return size;
							},

							set selected($$value) {
								size = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								RadioButton($$renderer, { value: 'sm', labelText: 'Small' });
								$$renderer.push(`<!----> `);
								RadioButton($$renderer, { value: 'lg', labelText: 'Large' });
								$$renderer.push(`<!----> `);
								RadioButton($$renderer, { value: 'xl', labelText: 'Extra large' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <pre>${$.escape(JSON.stringify(events.slice(0, 5), null, 2))}</pre>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}