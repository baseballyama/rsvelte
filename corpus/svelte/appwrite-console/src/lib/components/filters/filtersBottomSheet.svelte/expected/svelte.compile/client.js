import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { capitalize } from '$lib/helpers/string';
import { IconChevronLeft, IconChevronRight } from '@appwrite.io/pink-icons-svelte';
import { BottomSheet } from '..';
import { addFilterAndApply } from './quickFilters';

export default function FiltersBottomSheet($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let openBottomSheet = $.prop($$props, 'openBottomSheet', 15, false),
		filterCols = $.prop($$props, 'filterCols', 27, () => $.proxy([]));

	let subSheets = $.derived(() => filterCols().map((col) => {
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
							addFilterAndApply(col.id, col.title, col.operator, o.value, generateFilterArrayValue(col, o.value), $columns(), $$props.analyticsSource ?? '');
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
			items: filterCols().map((col) => {
				return {
					name: col.title,
					subMenu: $.get(subSheets).find((sheet) => sheet?.title === col?.title),
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
						filterCols().forEach((col) => {
							addFilterAndApply(col.id, col.title, col.operator, null, [], $columns(), $$props.analyticsSource ?? '');
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => BottomSheet.Menu, ($$anchor, BottomSheet_Menu) => {
		BottomSheet_Menu($$anchor, {
			get menu() {
				return $.get(filtersBottomSheet);
			},

			get isOpen() {
				return openBottomSheet();
			},

			set isOpen($$value) {
				openBottomSheet($$value);
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}