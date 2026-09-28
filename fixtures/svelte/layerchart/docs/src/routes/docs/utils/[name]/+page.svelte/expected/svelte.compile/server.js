import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';
import { Button, Table, TextField, ToggleButton } from 'svelte-ux';
import { h2 as H2 } from '@layerstack/docs/markdown/blueprints/default/blueprint.svelte';
import { tableCell } from '@layerstack/svelte-table';
import { ExampleLink, RelatedLink } from '@layerstack/docs/components';
import { allComponents } from 'content-collections';
import LucideSearch from '~icons/lucide/search';
import LucideZoomIn from '~icons/lucide/zoom-in';
import LucideZoomOut from '~icons/lucide/zoom-out';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		const PageComponent = $.derived(() => data.PageComponent),
			metadata = $.derived(() => data.metadata),
			api = $.derived(() => data.api),
			catalog = $.derived(() => data.catalog);

		const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;
		let columnCount = 3;
		let filterQuery = null;

		const examples = $.derived(() => {
			const exampleList = catalog()?.examples ?? [];

			if (!filterQuery) {
				return exampleList;
			}

			const query = filterQuery.toLowerCase().trim();

			return exampleList.filter((example) => example.name.toLowerCase().includes(query));
		});

		const uniqueUsage = $.derived(() => {
			if (!catalog()) return [];

			const seen = new Set();
			const query = filterQuery?.toLowerCase().trim();

			// Filter out if additional usage in same example or already shown in examples
			return catalog().usage.filter((item) => {
				const key = `${item.component}::${item.example}`;

				// Check if already shown in main examples
				if (catalog().examples.find((ex) => ex.name === item.example && catalog().component === item.component)) {
					return false;
				}

				// Check if already seen as additional usage in same example
				if (seen.has(key)) return false;

				seen.add(key);

				// Filter by query if provided
				if (query) {
					return item.example.toLowerCase().includes(query) || item.component.toLowerCase().includes(query);
				}

				return true;
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
				$$renderer.push(`<!--[0--><div class="grid grid-cols-[1fr_auto] items-center gap-2 mt-12">`);

				H2($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Examples`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="flex items-center gap-2 mb-2">`);

				{
					function prepend($$renderer) {
						LucideSearch($$renderer, { class: 'text-surface-content/50 mr-4' });
					}

					TextField($$renderer, {
						placeholder: 'Filter',
						dense: true,
						get value() {
							return filterQuery;
						},

						set value($$value) {
							filterQuery = $$value;
							$$settled = false;
						},
						prepend,
						$$slots: { prepend: true }
					});
				}

				$$renderer.push(`<!----> <div>`);

				Button($$renderer, {
					icon: LucideZoomOut,
					variant: 'fill-outline',
					class: 'size-8 border-surface-content/30 pt-1',
					disabled: columnCount >= 5
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: LucideZoomIn,
					variant: 'fill-outline',
					class: 'size-8 border-surface-content/30 pt-1',
					disabled: columnCount <= 1
				});

				$$renderer.push(`<!----></div></div></div> `);

				if (examples().length) {
					$$renderer.push(`<!--[0--><div class="grid grid-cols-(--column-count) gap-4"${$.attr_style('', { '--column-count': `repeat(${$.stringify(columnCount)}, 1fr)` })}><!--[-->`);

					const each_array = $.ensure_array_like(examples());

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let example = each_array[$$index];

						ExampleLink($$renderer, {
							component: catalog().component,
							example: example.name,
							title: example.title
						});
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (catalog().examples?.length) {
					$$renderer.push(`<!--[1--><p class="text-surface-content/50 text-sm">No examples match your filter.</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (uniqueUsage().length) {
					$$renderer.push('<!--[0-->');

					if (examples().length) {
						$$renderer.push('<!--[0-->');

						ToggleButton($$renderer, {
							transition: slide,
							class: 'mt-4',
							buttonPlacement: 'after',
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { on: showDetails }) => {
									$$renderer.push(`<!---->${$.escape(showDetails ? 'show less' : 'show more')}...`);
								},

								toggle: ($$renderer) => {
									$$renderer.push(`<div slot="toggle" class="mt-2"><div class="grid grid-cols-(--column-count) gap-4 border-t pt-4 mt-4"${$.attr_style('', { '--column-count': `repeat(${$.stringify(columnCount)}, 1fr)` })}><!--[-->`);

									const each_array_1 = $.ensure_array_like(uniqueUsage());

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let usage = each_array_1[$$index_1];

										ExampleLink($$renderer, {
											component: usage.component,
											example: usage.example,
											showComponent: true
										});
									}

									$$renderer.push(`<!--]--></div></div>`);
								}
							}
						});
					} else if (catalog().examples?.length === 0) {
						$$renderer.push(`<!--[1--><div class="grid grid-cols-(--column-count) gap-4"${$.attr_style('', { '--column-count': `repeat(${$.stringify(columnCount)}, 1fr)` })}><!--[-->`);

						const each_array_2 = $.ensure_array_like(uniqueUsage());

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let usage = each_array_2[$$index_2];

							ExampleLink($$renderer, {
								component: usage.component,
								example: usage.example,
								showComponent: true
							});
						}

						$$renderer.push(`<!--]--></div>`);
					} else if (catalog().usage?.length) {
						$$renderer.push(`<!--[2--><p class="text-surface-content/50 text-sm mt-2">No additional usage examples match your filter.</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (metadata().related.length) {
				$$renderer.push('<!--[0-->');

				H2($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Related`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="flex flex-wrap gap-2 mt-1"><!--[-->`);

				const each_array_3 = $.ensure_array_like(metadata().related);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let related = each_array_3[$$index_3];

					RelatedLink($$renderer, { value: related, resolveComponentExample });
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (api()?.properties.length) {
				$$renderer.push('<!--[0-->');

				H2($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->API Reference`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Table($$renderer, {
					data: api()?.properties,
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

							const each_array_4 = $.ensure_array_like(data ?? []);

							if (each_array_4.length !== 0) {
								$$renderer.push('<!--[-->');

								for (let rowIndex = 0, $$length = each_array_4.length; rowIndex < $$length; rowIndex++) {
									let rowData = each_array_4[rowIndex];

									$$renderer.push(`<tr class="hover:bg-surface-content/5 border-b"><!--[-->`);

									const each_array_5 = $.ensure_array_like(columns);

									for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
										let column = each_array_5[$$index_4];
										const value = getCellValue(column, rowData, rowIndex);

										$$renderer.push(`<td>`);

										if (column.name === 'name') {
											$$renderer.push(`<!--[0--><div class="flex items-center wrap gap-1"><span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border">${$.escape(value)}</span> `);

											if (rowData.required) {
												$$renderer.push(`<!--[0--><span class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs">required</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else if (column.name === 'type') {
											$$renderer.push(`<!--[1--><span class="font-pixel text-xs text-surface-content/70">${$.escape(value)}</span>`);
										} else if (column.name === 'description') {
											$$renderer.push(`<!--[2--><span class="whitespace-pre-line">${$.escape(value)}</span> `);

											if (rowData.default != null) {
												$$renderer.push(`<!--[0--><div class="mt-2 text-surface-content/70">default: <span class="font-pixel">${$.escape(rowData.default)}</span></div>`);
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

				if (api().extends?.length) {
					$$renderer.push(`<!--[0--><div class="mt-4">also available: <div class="inline-flex gap-2"><!--[-->`);

					const each_array_6 = $.ensure_array_like(api().extends);

					for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
						let extended = each_array_6[$$index_6];

						$$renderer.push(`<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border">${$.escape(extended.name)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}