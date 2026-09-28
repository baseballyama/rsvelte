import * as $ from 'svelte/internal/server';
import { capitalize } from '$lib/helpers/string';
import { IconChevronLeft, IconChevronRight } from '@appwrite.io/pink-icons-svelte';
import { BottomSheet } from '..';
import { addFilterAndApply } from './quickFilters';

export default function FiltersBottomSheet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			openBottomSheet = false,
			columns,
			filterCols = [],
			analyticsSource
		} = $$props;

		let subSheets = $.derived(() => filterCols.map((col) => {
			return {
				title: col.title,
				top: {
					title: col.title,
					trailingIcon: IconChevronRight,
					items: col.options.map((o) => {
						return {
							title: capitalize(o.label),
							name: capitalize(o.label),
							options: col.options,
							checked: o.checked,
							onClick: () => {
								addFilterAndApply(col.id, col.title, col.operator, o.value, generateFilterArrayValue(col, o.value), $.store_get($$store_subs ??= {}, '$columns', columns), analyticsSource ?? '');
							}
						};
					})
				},
				bottom: {
					name: 'Back',
					items: [
						{
							name: 'Back',
							leadingIcon: IconChevronLeft,
							navigatePrevious: true
						}
					]
				}
			};
		}));

		let filtersBottomSheet = $.derived(() => ({
			top: {
				title: 'Filters',
				items: filterCols.map((col) => {
					return {
						name: col.title,
						subMenu: subSheets().find((sheet) => sheet?.title === col?.title),
						trailingIcon: IconChevronRight
					};
				})
			},
			bottom: {
				name: 'Clear All',
				items: [
					{
						name: 'Clear All',
						onClick: () => {
							filterCols.forEach((col) => {
								addFilterAndApply(col.id, col.title, col.operator, null, [], $.store_get($$store_subs ??= {}, '$columns', columns), analyticsSource ?? '');
							});
						}
					}
				]
			}
		}));

		function generateFilterArrayValue(col, value) {
			if (!col?.array) return [];

			if (col.options?.find((opt) => opt.value === value)?.checked) {
				return col.options?.filter((opt) => opt?.checked).map((opt) => opt.value).filter((item) => item !== value);
			} else {
				let arrayValue = col.options?.filter((opt) => opt?.checked)?.map((opt) => opt.value) ?? [];

				arrayValue = [...arrayValue, value];

				return arrayValue;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (BottomSheet.Menu) {
				$$renderer.push('<!--[-->');

				BottomSheet.Menu($$renderer, {
					menu: filtersBottomSheet(),
					get isOpen() {
						return openBottomSheet;
					},

					set isOpen($$value) {
						openBottomSheet = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { openBottomSheet, filterCols });
	});
}