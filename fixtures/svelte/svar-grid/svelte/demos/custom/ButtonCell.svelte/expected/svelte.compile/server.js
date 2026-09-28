import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";

export default function ButtonCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column, onaction } = $$props;

		function onClick() {
			onaction && onaction({
				action: "custom-button",
				data: { column: column.id, row: row.id }
			});
		}

		$$renderer.push(`<span class="name svelte-1bbmz5f">${$.escape(row[column.id] || "Unknown")}</span> `);

		Button($$renderer, {
			type: 'primary',
			disabled: !row[column.id],
			onclick: onClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show on map`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}