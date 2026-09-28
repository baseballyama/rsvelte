import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from 'svelte-ux';
import { allComponents } from 'content-collections';
import { h2 as H2, h3 as H3 } from '@layerstack/docs/markdown/blueprints/default/blueprint.svelte';
import { tableCell } from '@layerstack/svelte-table';
import { ExampleListing, RelatedLink } from '@layerstack/docs/components';
import { page } from '$app/state';

var root = $.from_html(`<div class="mt-12"><!></div>`);
var root_1 = $.from_html(`<span class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs">required</span>`);
var root_2 = $.from_html(`<div class="flex items-center wrap gap-1"><span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border"> </span> <!></div>`);
var root_3 = $.from_html(`<span class="font-pixel text-xs text-surface-content/70"> </span>`);
var root_4 = $.from_html(`<span class="prose-inline"></span>`);
var root_5 = $.from_html(`<span class="whitespace-pre-line"> </span>`);
var root_6 = $.from_html(`<div class="mt-2 text-surface-content/70">default: <span class="font-pixel"> </span></div>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<td><!></td>`);
var root_9 = $.from_html(`<tr class="hover:bg-surface-content/5 border-b"></tr>`);
var root_10 = $.from_html(`<tr><td colspan="4" class="p-3 italic">No properties</td></tr>`);
var root_11 = $.from_html(`<tbody slot="data"></tbody>`);
var root_12 = $.from_html(`<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border"> </span>`);
var root_13 = $.from_html(`<div class="mt-4">also available: <div class="inline-flex gap-2"></div></div>`);
var root_14 = $.from_html(`<!> <!> <!>`, 1);
var root_15 = $.from_html(`<!> <div class="grid grid-cols-xs gap-2 mt-2"></div>`, 1);
var root_16 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const PageComponent = $.derived(() => $$props.data.PageComponent),
		catalog = $.derived(() => $$props.data.catalog);

	const metadata = $.derived(() => $$props.data.metadata);

	// One API table per entry — a single component normally, or each part of a compound
	// component (e.g. `Tooltip.Root`, `Tooltip.Item`) when listed via `components` frontmatter.
	const apis = $.derived(() => $.get(metadata).apis ?? []);

	const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;
	var fragment = root_16();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(PageComponent), ($$anchor, PageComponent_1) => {
		PageComponent_1($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_2 = $.child(div);

			ExampleListing(node_2, {
				get catalog() {
					return $.get(catalog);
				},

				get viewAllHref() {
					return `/docs/components/${page.params.name ?? ''}/examples`;
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(catalog) && ($.get(catalog).examples?.length || $.get(catalog).usage?.length)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_1 = root_7();
			var node_4 = $.first_child(fragment_1);

			H2(node_4, {
				id: 'api-reference',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('API Reference');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			$.each(node_5, 17, () => $.get(apis), (entry) => entry.component, ($$anchor, entry) => {
				var fragment_2 = root_14();
				var node_6 = $.first_child(fragment_2);

				{
					var consequent_1 = ($$anchor) => {
						{
							let $0 = $.derived(() => `api-${$.get(entry).component}`);

							H3($$anchor, {
								get id() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(entry).label));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_6, ($$render) => {
						if ($.get(apis).length > 1) $$render(consequent_1);
					});
				}

				var node_7 = $.sibling(node_6, 2);

				Table(node_7, {
					get data() {
						return $.get(entry).properties;
					},

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
						data: ($$anchor, $$slotProps) => {
							const columns = $.derived(() => $$slotProps.columns);
							const data = $.derived(() => $$slotProps.data);
							const getCellValue = $.derived(() => $$slotProps.getCellValue);
							const getCellContent = $.derived(() => $$slotProps.getCellContent);
							var tbody = root_11();

							$.each(
								tbody,
								21,
								() => $.get(data) ?? [],
								$.index,
								($$anchor, rowData, rowIndex) => {
									const row = $.derived(() => $.get(rowData));
									var tr = root_9();

									$.each(tr, 21, () => $.get(columns), (column) => column.name, ($$anchor, column) => {
										const value = $.derived(() => $.get(getCellValue)($.get(column), $.get(rowData), rowIndex));
										var td = root_8();
										var node_8 = $.child(td);

										{
											var consequent_3 = ($$anchor) => {
												var div_1 = root_2();
												var span = $.child(div_1);
												var text_2 = $.only_child(span, true);
												var node_9 = $.sibling(span, 2);

												{
													var consequent_2 = ($$anchor) => {
														var span_1 = root_1();

														$.append($$anchor, span_1);
													};

													$.if(node_9, ($$render) => {
														if ($.get(row).required) $$render(consequent_2);
													});
												}

												$.reset(div_1);
												$.template_effect(() => $.set_text(text_2, $.get(value)));
												$.append($$anchor, div_1);
											};

											var consequent_4 = ($$anchor) => {
												var span_2 = root_3();
												var text_3 = $.only_child(span_2, true);

												$.template_effect(() => $.set_text(text_3, $.get(value)));
												$.append($$anchor, span_2);
											};

											var consequent_7 = ($$anchor) => {
												var fragment_5 = root_7();
												var node_10 = $.first_child(fragment_5);

												{
													var consequent_5 = ($$anchor) => {
														var span_3 = root_4();

														$.html(span_3, () => $.get(row).descriptionHtml, true);
														$.reset(span_3);
														$.append($$anchor, span_3);
													};

													var alternate = ($$anchor) => {
														var span_4 = root_5();
														var text_4 = $.only_child(span_4, true);

														$.template_effect(() => $.set_text(text_4, $.get(value)));
														$.append($$anchor, span_4);
													};

													$.if(node_10, ($$render) => {
														if ($.get(row).descriptionHtml) $$render(consequent_5); else $$render(alternate, -1);
													});
												}

												var node_11 = $.sibling(node_10, 2);

												{
													var consequent_6 = ($$anchor) => {
														var div_2 = root_6();
														var span_5 = $.sibling($.child(div_2));
														var text_5 = $.only_child(span_5, true);

														$.reset(div_2);
														$.template_effect(() => $.set_text(text_5, $.get(row).default));
														$.append($$anchor, div_2);
													};

													$.if(node_11, ($$render) => {
														if ($.get(row).default != null) $$render(consequent_6);
													});
												}

												$.append($$anchor, fragment_5);
											};

											var alternate_1 = ($$anchor) => {
												var text_6 = $.text();

												$.template_effect(($0) => $.set_text(text_6, $0), [
													() => $.get(getCellContent)($.get(column), $.get(rowData), rowIndex)
												]);

												$.append($$anchor, text_6);
											};

											$.if(node_8, ($$render) => {
												if ($.get(column).name === 'name') $$render(consequent_3); else if ($.get(column).name === 'type') $$render(consequent_4, 1); else if ($.get(column).name === 'description') $$render(consequent_7, 2); else $$render(alternate_1, -1);
											});
										}

										$.reset(td);

										$.action(td, ($$node, $$action_arg) => tableCell?.($$node, $$action_arg), () => ({
											column: $.get(column),
											rowData: $.get(rowData),
											rowIndex,
											tableData: $.get(data)
										}));

										$.append($$anchor, td);
									});

									$.reset(tr);
									$.append($$anchor, tr);
								},
								($$anchor) => {
									var tr_1 = root_10();

									$.append($$anchor, tr_1);
								}
							);

							$.reset(tbody);
							$.append($$anchor, tbody);
						}
					}
				});

				var node_12 = $.sibling(node_7, 2);

				{
					var consequent_8 = ($$anchor) => {
						var div_3 = root_13();
						var div_4 = $.sibling($.child(div_3));

						$.each(div_4, 21, () => $.get(entry).extends, $.index, ($$anchor, extended) => {
							var span_6 = root_12();
							var text_7 = $.only_child(span_6, true);

							$.template_effect(() => $.set_text(text_7, $.get(extended).name));
							$.append($$anchor, span_6);
						});

						$.reset(div_4);
						$.reset(div_3);
						$.append($$anchor, div_3);
					};

					$.if(node_12, ($$render) => {
						if ($.get(entry).extends?.length) $$render(consequent_8);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(apis).length) $$render(consequent_9);
		});
	}

	var node_13 = $.sibling(node_3, 2);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_7 = root_15();
			var node_14 = $.first_child(fragment_7);

			H2(node_14, {
				id: 'related',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Related');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_14, 2);

			$.each(div_5, 21, () => $.get(metadata).related, $.index, ($$anchor, related) => {
				RelatedLink($$anchor, {
					get value() {
						return $.get(related);
					},
					resolveComponentExample
				});
			});

			$.reset(div_5);
			$.append($$anchor, fragment_7);
		};

		$.if(node_13, ($$render) => {
			if ($.get(metadata).related.length) $$render(consequent_10);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}