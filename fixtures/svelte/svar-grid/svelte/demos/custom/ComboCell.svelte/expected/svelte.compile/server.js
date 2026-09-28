import * as $ from 'svelte/internal/server';
import { Combo } from "@svar-ui/svelte-core";

export default function ComboCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column, onaction } = $$props;

		const options = [
			{ id: 1, label: "New Amieshire" },
			{ id: 2, label: "New Gust" },
			{ id: 3, label: "Lefflerstad" },
			{ id: 4, label: "East Catalina" },
			{ id: 5, label: "Ritchieborough" }
		];

		const id = $.derived(() => {
			const option = options.find((i) => i.label === row[column.id]);

			return option && option.id ? option.id : 1;
		});

		function onChange(ev) {
			const { value } = ev;

			onaction && onaction({
				action: "custom-combo",
				data: {
					value: options.find((i) => i.id === value).label,
					column: column.id,
					row: row.id
				}
			});
		}

		{
			function children($$renderer, { option }) {
				$$renderer.push(`<!---->${$.escape(option.label)}`);
			}

			Combo($$renderer, {
				options,
				value: id(),
				onchange: onChange,
				children,
				$$slots: { default: true }
			});
		}
	});
}