import * as $ from 'svelte/internal/server';
import { SpatialMenu } from "$lib/builders/SpatialMenu.svelte.js";

export default function SpatialMenuNavTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { initial, wrap = false, crossAxis = false } = $$props;
		const cols = initial[0]?.split(" ").length ?? 0;
		let highlighted = void 0;
		const rows = [];

		initial.forEach((row, rowIndex) => {
			const res = [];
			const cols = row.split(" ");

			cols.forEach((col, colIndex) => {
				const id = `${rowIndex}-${colIndex}`;

				res.push({ id, disabled: col === "x" });

				if (col === "h") {
					highlighted = id;
				}
			});

			rows.push(res);
		});

		const menu = new SpatialMenu({
			highlighted: () => highlighted,
			onHighlightChange: (id) => {
				highlighted = id;
			},
			wrap,
			crossAxis
		});

		const getHighlighted = () => highlighted;

		$$renderer.push(`<div${$.attributes(
			{
				style: `grid-template-columns: repeat(${$.stringify(cols)}, 1fr);`,
				...menu.root,
				'data-testid': 'spatial-root'
			},
			'svelte-13vftyf'
		)}><!--[-->`);

		const each_array = $.ensure_array_like(rows);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];

			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(row);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let col = each_array_1[$$index];
				const item = menu.getItem(col.id, { disabled: col.disabled });

				$$renderer.push(`<div${$.attributes({ ...item.attrs, 'data-testid': 'spatial-item' }, 'svelte-13vftyf')}>${$.escape(col.id)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { getHighlighted });
	});
}