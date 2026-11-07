import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect, Badge } from "flowbite-svelte";

export default function Customization($$anchor) {
	let selected = [];

	let countries = [
		{ value: "us", name: "United States", color: "indigo" },
		{ value: "ca", name: "Canada", color: "green" },
		{ value: "fr", name: "France", color: "blue" },
		{ value: "jp", name: "Japan", color: "red" },
		{ value: "en", name: "England", color: "yellow" }
	];

	{
		const children = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let clear = () => ($$arg0?.()).clear;

			Badge($$anchor, {
				get color() {
					return item().color;
				},
				dismissable: true,
				params: { duration: 100 },
				get onclose() {
					return clear();
				},
				class: 'mx-0.5',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, item().name));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		MultiSelect($$anchor, {
			get items() {
				return countries;
			},

			get value() {
				return selected;
			},
			children,
			$$slots: { default: true }
		});
	}
}