import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Table, Tooltip } from 'svelte-ux';
import { tableCell } from '@layerstack/svelte-table';
import { cls } from '@layerstack/tailwind';
import LucideCheck from '~icons/lucide/check';
import LucideX from '~icons/lucide/x';
import LucideInfo from '~icons/lucide/info';

var root = $.from_html(`<!> Yes`, 1);
var root_1 = $.from_html(`<!> No`, 1);
var root_2 = $.from_html(`<span>i</span>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<td><!></td>`);
var root_5 = $.from_html(`<tr class="hover:bg-surface-content/5 border-b"></tr>`);
var root_6 = $.from_html(`<tr><td colspan="4" class="p-3 italic">No properties</td></tr>`);
var root_7 = $.from_html(`<tbody slot="data"></tbody>`);

export default function FeatureTable($$anchor, $$props) {
	$.push($$props, true);

	Table($$anchor, {
		get data() {
			return $$props.data;
		},

		columns: [
			{
				name: 'feature',
				header: 'Feature',
				classes: { th: 'bg-surface-200', td: 'w-100 max-sm:bg-surface-200' },
				sticky: { left: true }
			},
			{ name: 'svg', header: 'Svg' },
			{ name: 'html', header: 'Html' },
			{ name: 'canvas', header: 'Canvas' },
			{ name: 'webgl', header: 'WebGL' }
		],
		classes: {
			container: 'overflow-x-auto',
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
				var tbody = root_7();

				$.each(
					tbody,
					21,
					() => $.get(data) ?? [],
					$.index,
					($$anchor, rowData, rowIndex) => {
						var tr = root_5();

						$.each(tr, 21, () => $.get(columns), (column) => column.name, ($$anchor, column) => {
							const value = $.derived(() => $.get(getCellValue)($.get(column), $.get(rowData), rowIndex));
							var td = root_4();
							var node = $.child(td);

							{
								var consequent = ($$anchor) => {
									var text = $.text();

									$.template_effect(($0) => $.set_text(text, $0), [
										() => $.get(getCellContent)($.get(column), $.get(rowData), rowIndex)
									]);

									$.append($$anchor, text);
								};

								var alternate_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => [$.get(value).note?.trim(), $.get(value).link?.trim()].filter(Boolean).join('\n') ?? '');

										Tooltip($$anchor, {
											get title() {
												return $.get($0);
											},
											placement: 'top',
											offset: 2,
											classes: { title: 'whitespace-pre-line' },
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => cls('relative inline-flex items-center gap-1 border px-2 pr-3 font-semibold rounded-full border-current', $.get(value).support
														? 'text-success bg-success/5'
														: 'text-danger bg-danger/5'));

													Button($$anchor, {
														get href() {
															return $.get(value).link;
														},
														target: '_blank',
														variant: 'none',
														get class() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_3();
															var node_1 = $.first_child(fragment_4);

															{
																var consequent_1 = ($$anchor) => {
																	var fragment_5 = root();
																	var node_2 = $.first_child(fragment_5);

																	LucideCheck(node_2, {});
																	$.next();
																	$.append($$anchor, fragment_5);
																};

																var alternate = ($$anchor) => {
																	var fragment_6 = root_1();
																	var node_3 = $.first_child(fragment_6);

																	LucideX(node_3, {});
																	$.next();
																	$.append($$anchor, fragment_6);
																};

																$.if(node_1, ($$render) => {
																	if ($.get(value).support) $$render(consequent_1); else $$render(alternate, -1);
																});
															}

															var node_4 = $.sibling(node_1, 2);

															{
																var consequent_2 = ($$anchor) => {
																	var span = root_2();

																	$.template_effect(($0) => $.set_class(span, 1, $0), [
																		() => $.clsx(cls('absolute top-0 right-0 translate-x-1/2 -translate-y-1/2', 'size-4 grid place-content-center border border-surface-100 rounded-full bg-current text-xs', $.get(value).support
																			? 'text-success-content bg-success'
																			: 'text-danger-content bg-danger'))
																	]);

																	$.append($$anchor, span);
																};

																$.if(node_4, ($$render) => {
																	if ($.get(value).note || $.get(value).link) $$render(consequent_2);
																});
															}

															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												}
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node, ($$render) => {
									if ($.get(column).name === 'feature') $$render(consequent); else $$render(alternate_1, -1);
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
						var tr_1 = root_6();

						$.append($$anchor, tr_1);
					}
				);

				$.reset(tbody);
				$.append($$anchor, tbody);
			}
		}
	});

	$.pop();
}