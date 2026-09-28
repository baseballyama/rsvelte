import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import TableBodyRow from "./TableBodyRow.svelte";
import TableBodyCell from "./TableBodyCell.svelte";

export default function TableBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			bodyItems,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function getCellValues(row) {
			if (Array.isArray(row)) {
				return row;
			} else {
				return Object.values(row);
			}
		}

		$$renderer.push(`<tbody${$.attributes({ ...restProps, class: $.clsx(clsx(className)) })}>`);

		if (bodyItems) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(bodyItems);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let row = each_array[i];

				TableBodyRow($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(getCellValues(row));

						for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
							let cellValue = each_array_1[j];

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(cellValue ?? "")}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></tbody>`);
	});
}