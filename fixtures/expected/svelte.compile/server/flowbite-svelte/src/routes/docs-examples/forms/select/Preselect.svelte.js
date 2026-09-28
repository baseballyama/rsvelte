import * as $ from 'svelte/internal/server';
import { MultiSelect, Badge } from "flowbite-svelte";

export default function Preselect($$renderer) {
	let colorCountries = [
		{ value: "us", name: "United States", color: "indigo" },
		{ value: "ca", name: "Canada", color: "green" },
		{ value: "fr", name: "France", color: "blue" },
		{ value: "jp", name: "Japan", color: "red" },
		{ value: "en", name: "England", color: "yellow" }
	];

	let preselected = ["us", "fr"];

	{
		function children($$renderer, { item, clear }) {
			Badge($$renderer, {
				color: item.color,
				dismissable: true,
				params: { duration: 100 },
				onclose: clear,
				class: 'mx-0.5',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(item.name)}`);
				},
				$$slots: { default: true }
			});
		}

		MultiSelect($$renderer, {
			items: colorCountries,
			value: preselected,
			children,
			$$slots: { default: true }
		});
	}
}