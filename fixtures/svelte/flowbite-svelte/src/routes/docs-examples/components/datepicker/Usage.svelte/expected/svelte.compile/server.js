import * as $ from 'svelte/internal/server';
import { Datepicker, P, Label, Select, Button } from "flowbite-svelte";

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = undefined;
		let locale = "de";

		const locales = [
			{ value: "en-US", name: "en-US (US)" },
			{ value: "en-GB", name: "en-GB (UK)" },
			{ value: "de", name: "de (Germany)" },
			{ value: "fr", name: "fr (France)" },
			{ value: "ja", name: "ja (Japan)" }
		];

		const handleSubmit = (event) => {
			event.preventDefault();
			console.log("Selected date:", value ? value.toLocaleDateString(locale) : "None");
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="overflow-visible p-4"><h1 class="mb-4 text-xl font-bold">Datepicker Locale Test</h1> <form class="mb-4">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose locale: `);

					Select($$renderer, {
						class: 'mb-4 w-40 rounded p-2',
						items: locales,
						get value() {
							return locale;
						},

						set value($$value) {
							locale = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Datepicker($$renderer, {
				locale,
				translationLocale: locale,
				placeholder: 'Type a date or use calendar',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				class: 'mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<strong>Selected Locale:</strong> ${$.escape(locale)} <br/> <strong>Selected Date:</strong> ${$.escape(value ? value.toLocaleDateString(locale) : "None")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				class: 'mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}