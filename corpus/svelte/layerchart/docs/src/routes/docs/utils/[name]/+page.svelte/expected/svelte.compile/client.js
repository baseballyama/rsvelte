import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';
import { Button, Table, TextField, ToggleButton } from 'svelte-ux';
import { h2 as H2 } from '@layerstack/docs/markdown/blueprints/default/blueprint.svelte';
import { tableCell } from '@layerstack/svelte-table';
import { ExampleLink, RelatedLink } from '@layerstack/docs/components';
import { allComponents } from 'content-collections';
import LucideSearch from '~icons/lucide/search';
import LucideZoomIn from '~icons/lucide/zoom-in';
import LucideZoomOut from '~icons/lucide/zoom-out';

var root = $.from_html(`<div class="grid grid-cols-(--column-count) gap-4"></div>`);
var root_1 = $.from_html(`<p class="text-surface-content/50 text-sm">No examples match your filter.</p>`);
var root_2 = $.from_html(`<div slot="toggle" class="mt-2"><div class="grid grid-cols-(--column-count) gap-4 border-t pt-4 mt-4"></div></div>`);
var root_3 = $.from_html(`<p class="text-surface-content/50 text-sm mt-2">No additional usage examples match your filter.</p>`);
var root_4 = $.from_html(`<div class="grid grid-cols-[1fr_auto] items-center gap-2 mt-12"><!> <div class="flex items-center gap-2 mb-2"><!> <div><!> <!></div></div></div> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <div class="flex flex-wrap gap-2 mt-1"></div>`, 1);
var root_6 = $.from_html(`<span class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs">required</span>`);
var root_7 = $.from_html(`<div class="flex items-center wrap gap-1"><span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border"> </span> <!></div>`);
var root_8 = $.from_html(`<span class="font-pixel text-xs text-surface-content/70"> </span>`);
var root_9 = $.from_html(`<div class="mt-2 text-surface-content/70">default: <span class="font-pixel"> </span></div>`);
var root_10 = $.from_html(`<span class="whitespace-pre-line"> </span> <!>`, 1);
var root_11 = $.from_html(`<td><!></td>`);
var root_12 = $.from_html(`<tr class="hover:bg-surface-content/5 border-b"></tr>`);
var root_13 = $.from_html(`<tr><td colspan="4" class="p-3 italic">No properties</td></tr>`);
var root_14 = $.from_html(`<tbody slot="data"></tbody>`);
var root_15 = $.from_html(`<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border"> </span>`);
var root_16 = $.from_html(`<div class="mt-4">also available: <div class="inline-flex gap-2"></div></div>`);
var root_17 = $.from_html(`<!> <!> <!>`, 1);
var root_18 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const PageComponent = $.derived(() => $$props.data.PageComponent),
		metadata = $.derived(() => $$props.data.metadata),
		api = $.derived(() => $$props.data.api),
		catalog = $.derived(() => $$props.data.catalog);

	const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;
	let columnCount = $.state(3);
	let filterQuery = $.state(null);

	const examples = $.derived(() => {
		const exampleList = $.get(catalog)?.examples ?? [];

		if (!$.get(filterQuery)) {
			return exampleList;
		}

		const query = $.get(filterQuery).toLowerCase().trim();

		return exampleList.filter((example) => example.name.toLowerCase().includes(query));
	});

	const uniqueUsage = $.derived(() => {
		if (!$.get(catalog)) return [];

		const seen = new Set();
		const query = $.get(filterQuery)?.toLowerCase().trim();

		// Filter out if additional usage in same example or already shown in examples
		return $.get(catalog).usage.filter((item) => {
			const key = `${item.component}::${item.example}`;

			// Check if already shown in main examples
			if ($.get(catalog).examples.find((ex) => ex.name === item.example && $.get(catalog).component === item.component)) {
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

	var fragment = root_18();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(PageComponent), ($$anchor, PageComponent_1) => {
		PageComponent_1($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = root_4();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			H2(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Examples');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_2, 2);
			var node_3 = $.child(div_1);

			{
				const prepend = ($$anchor) => {
					LucideSearch($$anchor, { class: 'text-surface-content/50 mr-4' });
				};

				TextField(node_3, {
					placeholder: 'Filter',
					dense: true,
					get value() {
						return $.get(filterQuery);
					},

					set value($$value) {
						$.set(filterQuery, $$value, true);
					},
					prepend,
					$$slots: { prepend: true }
				});
			}

			var div_2 = $.sibling(node_3, 2);
			var node_4 = $.child(div_2);

			{
				let $0 = $.derived(() => $.get(columnCount) >= 5);

				Button(node_4, {
					get icon() {
						return LucideZoomOut;
					},
					variant: 'fill-outline',
					class: 'size-8 border-surface-content/30 pt-1',
					get disabled() {
						return $.get($0);
					},

					$$events: {
						click: () => $.set(columnCount, Math.min(5, $.get(columnCount) + 1), true)
					}
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => $.get(columnCount) <= 1);

				Button(node_5, {
					get icon() {
						return LucideZoomIn;
					},
					variant: 'fill-outline',
					class: 'size-8 border-surface-content/30 pt-1',
					get disabled() {
						return $.get($0);
					},

					$$events: {
						click: () => $.set(columnCount, Math.max(1, $.get(columnCount) - 1), true)
					}
				});
			}

			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var node_6 = $.sibling(div, 2);

			{
				var consequent = ($$anchor) => {
					var div_3 = root();
					let styles;

					$.each(div_3, 21, () => $.get(examples), $.index, ($$anchor, example) => {
						ExampleLink($$anchor, {
							get component() {
								return $.get(catalog).component;
							},

							get example() {
								return $.get(example).name;
							},

							get title() {
								return $.get(example).title;
							}
						});
					});

					$.reset(div_3);
					$.template_effect(() => styles = $.set_style(div_3, '', styles, { '--column-count': `repeat(${$.get(columnCount) ?? ''}, 1fr)` }));
					$.append($$anchor, div_3);
				};

				var consequent_1 = ($$anchor) => {
					var p = root_1();

					$.append($$anchor, p);
				};

				$.if(node_6, ($$render) => {
					if ($.get(examples).length) $$render(consequent); else if ($.get(catalog).examples?.length) $$render(consequent_1, 1);
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_8 = $.first_child(fragment_4);

					{
						var consequent_2 = ($$anchor) => {
							ToggleButton($$anchor, {
								get transition() {
									return slide;
								},
								class: 'mt-4',
								buttonPlacement: 'after',
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const showDetails = $.derived(() => $$slotProps.on);

										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `${$.get(showDetails) ? 'show less' : 'show more'}...`));
										$.append($$anchor, text_1);
									},

									toggle: ($$anchor, $$slotProps) => {
										var div_4 = root_2();
										var div_5 = $.child(div_4);
										let styles_1;

										$.each(div_5, 21, () => $.get(uniqueUsage), $.index, ($$anchor, usage) => {
											ExampleLink($$anchor, {
												get component() {
													return $.get(usage).component;
												},

												get example() {
													return $.get(usage).example;
												},
												showComponent: true
											});
										});

										$.reset(div_5);
										$.reset(div_4);
										$.template_effect(() => styles_1 = $.set_style(div_5, '', styles_1, { '--column-count': `repeat(${$.get(columnCount) ?? ''}, 1fr)` }));
										$.append($$anchor, div_4);
									}
								}
							});
						};

						var consequent_3 = ($$anchor) => {
							var div_6 = root();
							let styles_2;

							$.each(div_6, 21, () => $.get(uniqueUsage), $.index, ($$anchor, usage) => {
								ExampleLink($$anchor, {
									get component() {
										return $.get(usage).component;
									},

									get example() {
										return $.get(usage).example;
									},
									showComponent: true
								});
							});

							$.reset(div_6);
							$.template_effect(() => styles_2 = $.set_style(div_6, '', styles_2, { '--column-count': `repeat(${$.get(columnCount) ?? ''}, 1fr)` }));
							$.append($$anchor, div_6);
						};

						var consequent_4 = ($$anchor) => {
							var p_1 = root_3();

							$.append($$anchor, p_1);
						};

						$.if(node_8, ($$render) => {
							if ($.get(examples).length) $$render(consequent_2); else if ($.get(catalog).examples?.length === 0) $$render(consequent_3, 1); else if ($.get(catalog).usage?.length) $$render(consequent_4, 2);
						});
					}

					$.append($$anchor, fragment_4);
				};

				$.if(node_7, ($$render) => {
					if ($.get(uniqueUsage).length) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(catalog) && ($.get(catalog).examples?.length || $.get(catalog).usage?.length)) $$render(consequent_6);
		});
	}

	var node_9 = $.sibling(node_1, 2);

	{
		var consequent_7 = ($$anchor) => {
			var fragment_9 = root_5();
			var node_10 = $.first_child(fragment_9);

			H2(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Related');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_10, 2);

			$.each(div_7, 21, () => $.get(metadata).related, $.index, ($$anchor, related) => {
				RelatedLink($$anchor, {
					get value() {
						return $.get(related);
					},
					resolveComponentExample
				});
			});

			$.reset(div_7);
			$.append($$anchor, fragment_9);
		};

		$.if(node_9, ($$render) => {
			if ($.get(metadata).related.length) $$render(consequent_7);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_14 = ($$anchor) => {
			var fragment_11 = root_17();
			var node_12 = $.first_child(fragment_11);

			H2(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('API Reference');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			{
				let $0 = $.derived(() => $.get(api)?.properties);

				Table(node_13, {
					get data() {
						return $.get($0);
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
							var tbody = root_14();

							$.each(
								tbody,
								21,
								() => $.get(data) ?? [],
								$.index,
								($$anchor, rowData, rowIndex) => {
									var tr = root_12();

									$.each(tr, 21, () => $.get(columns), (column) => column.name, ($$anchor, column) => {
										const value = $.derived(() => $.get(getCellValue)($.get(column), $.get(rowData), rowIndex));
										var td = root_11();
										var node_14 = $.child(td);

										{
											var consequent_9 = ($$anchor) => {
												var div_8 = root_7();
												var span = $.child(div_8);
												var text_4 = $.only_child(span, true);
												var node_15 = $.sibling(span, 2);

												{
													var consequent_8 = ($$anchor) => {
														var span_1 = root_6();

														$.append($$anchor, span_1);
													};

													$.if(node_15, ($$render) => {
														if ($.get(rowData).required) $$render(consequent_8);
													});
												}

												$.reset(div_8);
												$.template_effect(() => $.set_text(text_4, $.get(value)));
												$.append($$anchor, div_8);
											};

											var consequent_10 = ($$anchor) => {
												var span_2 = root_8();
												var text_5 = $.only_child(span_2, true);

												$.template_effect(() => $.set_text(text_5, $.get(value)));
												$.append($$anchor, span_2);
											};

											var consequent_12 = ($$anchor) => {
												var fragment_12 = root_10();
												var span_3 = $.first_child(fragment_12);
												var text_6 = $.only_child(span_3, true);
												var node_16 = $.sibling(span_3, 2);

												{
													var consequent_11 = ($$anchor) => {
														var div_9 = root_9();
														var span_4 = $.sibling($.child(div_9));
														var text_7 = $.only_child(span_4, true);

														$.reset(div_9);
														$.template_effect(() => $.set_text(text_7, $.get(rowData).default));
														$.append($$anchor, div_9);
													};

													$.if(node_16, ($$render) => {
														if ($.get(rowData).default != null) $$render(consequent_11);
													});
												}

												$.template_effect(() => $.set_text(text_6, $.get(value)));
												$.append($$anchor, fragment_12);
											};

											var alternate = ($$anchor) => {
												var text_8 = $.text();

												$.template_effect(($0) => $.set_text(text_8, $0), [
													() => $.get(getCellContent)($.get(column), $.get(rowData), rowIndex)
												]);

												$.append($$anchor, text_8);
											};

											$.if(node_14, ($$render) => {
												if ($.get(column).name === 'name') $$render(consequent_9); else if ($.get(column).name === 'type') $$render(consequent_10, 1); else if ($.get(column).name === 'description') $$render(consequent_12, 2); else $$render(alternate, -1);
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
									var tr_1 = root_13();

									$.append($$anchor, tr_1);
								}
							);

							$.reset(tbody);
							$.append($$anchor, tbody);
						}
					}
				});
			}

			var node_17 = $.sibling(node_13, 2);

			{
				var consequent_13 = ($$anchor) => {
					var div_10 = root_16();
					var div_11 = $.sibling($.child(div_10));

					$.each(div_11, 21, () => $.get(api).extends, $.index, ($$anchor, extended) => {
						var span_5 = root_15();
						var text_9 = $.only_child(span_5, true);

						$.template_effect(() => $.set_text(text_9, $.get(extended).name));
						$.append($$anchor, span_5);
					});

					$.reset(div_11);
					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_17, ($$render) => {
					if ($.get(api).extends?.length) $$render(consequent_13);
				});
			}

			$.append($$anchor, fragment_11);
		};

		$.if(node_11, ($$render) => {
			if ($.get(api)?.properties.length) $$render(consequent_14);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}