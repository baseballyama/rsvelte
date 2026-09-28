import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";

export default function HeaderButtonCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onaction } = $$props;

		function onClick() {
			onaction && onaction({
				action: "add-row",
				data: {
					row: {
						firstName: "John",
						lastName: "Smith",
						email: "realemail@gmail.com",
						city: "New York"
					}
				}
			});
		}

		Button($$renderer, {
			type: "secondary",
			icon: 'wxi-plus',
			onclick: onClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Add row`);
			},
			$$slots: { default: true }
		});
	});
}