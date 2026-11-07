import * as $ from 'svelte/internal/server';
import { Table } from 'svelte-ux';
import { allComponents } from 'content-collections';
import { h2 as H2, h3 as H3 } from '@layerstack/docs/markdown/blueprints/default/blueprint.svelte';
import { tableCell } from '@layerstack/svelte-table';
import { ExampleListing, RelatedLink } from '@layerstack/docs/components';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		const PageComponent = $.derived(() => data.PageComponent),
			catalog = $.derived(() => data.catalog);

		const metadata = $.derived(() => data.metadata);

		// One API table per entry — a single component normally, or each part of a compound
		// component (e.g. `Tooltip.Root`, `Tooltip.Item`) when listed via `components` frontmatter.
		const apis = $.derived(() => metadata().apis ?? []);

		const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;

		if (PageComponent()) {
			$$renderer.push('<!--[-->');
			PageComponent()($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (catalog() && (catalog().examples?.length || catalog().usage?.length)) {
			$$renderer.push(`<!--[0--><div class="mt-12">`);

			ExampleListing($$renderer, {
				catalog: catalog(),
				viewAllHref: `/docs/components/${$.stringify(page.params.name)}/examples`
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (apis().length) {
			$$renderer.push('<!--[0-->');

			H2($$renderer, {
				id: 'api-reference',
				children: ($$renderer) => {
					$$renderer.push(`<!---->API Reference`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(apis());

			for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
				let entry = each_array[$$index_3];

				if (apis().length > 1) {
					$$renderer.push('<!--[0-->');

					H3($$renderer, {
						id: `api-${entry.component}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(entry.label)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Table($$renderer, {
					data: entry.properties,
					columns: [
						{ name: 'name', header: 'Property' },
						{ name: 'description', header: 'Description' },
						{ name: 'type', header: 'Type' }
					],
					classes: {
						table: 'text-sm mt-1',
						th: 'border-b px-3 py-2 text-surface-content/50',
						tr: 'border-b last:border-b-0',
						td: 'px-3 py-4'
					},
					$$slots: {
						data: ($$renderer, { columns, data, getCellValue, getCellContent }) => {
							$$renderer.push(`<tbody slot="data">`);

							const each_array_1 = $.ensure_array_like(data ?? []);

							if (each_array_1.length !== 0) {
								$$renderer.push('<!--[-->');

								for (let rowIndex = 0, $$length = each_array_1.length; rowIndex < $$length; rowIndex++) {
									let rowData = each_array_1[rowIndex];
									const row = rowData;

									$$renderer.push(`<tr class="hover:bg-surface-content/5 border-b"><!--[-->`);

									const each_array_2 = $.ensure_array_like(columns);

									for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
										let column = each_array_2[$$index];
										const value = getCellValue(column, rowData, rowIndex);

										$$renderer.push(`<td>`);

										if (column.name === 'name') {
											$$renderer.push(`<!--[0--><div class="flex items-center wrap gap-1"><span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border">${$.escape(value)}</span> `);

											if (row.required) {
												$$renderer.push(`<!--[0--><span class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs">required</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else if (column.name === 'type') {
											$$renderer.push(`<!--[1--><span class="font-pixel text-xs text-surface-content/70">${$.escape(value)}</span>`);
										} else if (column.name === 'description') {
											$$renderer.push('<!--[2-->');

											if (row.descriptionHtml) {
												$$renderer.push(`<!--[0--><span class="prose-inline">${$.html(row.descriptionHtml)}</span>`);
											} else {
												$$renderer.push(`<!--[-1--><span class="whitespace-pre-line">${$.escape(value)}</span>`);
											}

											$$renderer.push(`<!--]--> `);

											if (row.default != null) {
												$$renderer.push(`<!--[0--><div class="mt-2 text-surface-content/70">default: <span class="font-pixel">${$.escape(row.default)}</span></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										} else {
											$$renderer.push(`<!--[-1-->${$.escape(getCellContent(column, rowData, rowIndex))}`);
										}

										$$renderer.push(`<!--]--></td>`);
									}

									$$renderer.push(`<!--]--></tr>`);
								}
							} else {
								$$renderer.push(`<!--[!--><tr><td colspan="4" class="p-3 italic">No properties</td></tr>`);
							}

							$$renderer.push(`<!--]--></tbody>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				if (entry.extends?.length) {
					$$renderer.push(`<!--[0--><div class="mt-4">also available: <div class="inline-flex gap-2"><!--[-->`);

					const each_array_3 = $.ensure_array_like(entry.extends);

					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let extended = each_array_3[$$index_2];

						$$renderer.push(`<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border">${$.escape(extended.name)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (metadata().related.length) {
			$$renderer.push('<!--[0-->');

			H2($$renderer, {
				id: 'related',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Related`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="grid grid-cols-xs gap-2 mt-2"><!--[-->`);

			const each_array_4 = $.ensure_array_like(metadata().related);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let related = each_array_4[$$index_4];

				RelatedLink($$renderer, { value: related, resolveComponentExample });
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}