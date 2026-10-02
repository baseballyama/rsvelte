import * as $ from 'svelte/internal/server';
import { Button, Table, Tooltip } from 'svelte-ux';
import { tableCell } from '@layerstack/svelte-table';
import { cls } from '@layerstack/tailwind';
import LucideCheck from '~icons/lucide/check';
import LucideX from '~icons/lucide/x';
import LucideInfo from '~icons/lucide/info';

export default function FeatureTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		Table($$renderer, {
			data,
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
				data: ($$renderer, { columns, data, getCellValue, getCellContent }) => {
					$$renderer.push(`<tbody slot="data">`);

					const each_array = $.ensure_array_like(data ?? []);

					if (each_array.length !== 0) {
						$$renderer.push('<!--[-->');

						for (let rowIndex = 0, $$length = each_array.length; rowIndex < $$length; rowIndex++) {
							let rowData = each_array[rowIndex];

							$$renderer.push(`<tr class="hover:bg-surface-content/5 border-b"><!--[-->`);

							const each_array_1 = $.ensure_array_like(columns);

							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let column = each_array_1[$$index];
								const value = getCellValue(column, rowData, rowIndex);

								$$renderer.push(`<td>`);

								if (column.name === 'feature') {
									$$renderer.push(`<!--[0-->${$.escape(getCellContent(column, rowData, rowIndex))}`);
								} else {
									$$renderer.push('<!--[-1-->');

									Tooltip($$renderer, {
										title: [value.note?.trim(), value.link?.trim()].filter(Boolean).join('\n') ?? '',
										placement: 'top',
										offset: 2,
										classes: { title: 'whitespace-pre-line' },
										children: ($$renderer) => {
											Button($$renderer, {
												href: value.link,
												target: '_blank',
												variant: 'none',
												class: cls('relative inline-flex items-center gap-1 border px-2 pr-3 font-semibold rounded-full border-current', value.support
													? 'text-success bg-success/5'
													: 'text-danger bg-danger/5'),

												children: ($$renderer) => {
													if (value.support) {
														$$renderer.push('<!--[0-->');
														LucideCheck($$renderer, {});
														$$renderer.push(`<!----> Yes`);
													} else {
														$$renderer.push('<!--[-1-->');
														LucideX($$renderer, {});
														$$renderer.push(`<!----> No`);
													}

													$$renderer.push(`<!--]--> `);

													if (value.note || value.link) {
														$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(cls('absolute top-0 right-0 translate-x-1/2 -translate-y-1/2', 'size-4 grid place-content-center border border-surface-100 rounded-full bg-current text-xs', value.support
															? 'text-success-content bg-success'
															: 'text-danger-content bg-danger')))}>i</span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
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
	});
}