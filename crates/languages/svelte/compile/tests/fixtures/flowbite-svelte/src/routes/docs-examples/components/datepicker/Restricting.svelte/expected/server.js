import * as $ from 'svelte/internal/server';
import { Datepicker, P } from "flowbite-svelte";

export default function Restricting($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedDate = undefined;

		// Helper function to add/subtract days
		function addDays(date, days) {
			const result = new Date(date);

			result.setDate(result.getDate() + days);

			return result;
		}

		// Calculate dates relative to today
		const today = new Date();

		const availableFrom = addDays(today, -10); // 10 days ago
		const availableTo = addDays(today, 10); // 10 days from now

		function formatDate(date) {
			return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Datepicker($$renderer, {
				availableFrom,
				availableTo,
				placeholder: 'Select available date',
				get value() {
					return selectedDate;
				},

				set value($$value) {
					selectedDate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				class: 'mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Available from: ${$.escape(formatDate(availableFrom))} to: ${$.escape(formatDate(availableTo))}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Selected date: ${$.escape(selectedDate ? formatDate(selectedDate) : "None selected")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				class: 'mt-4 text-sm text-gray-600',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Today: ${$.escape(formatDate(today))} <br/> Range: 10 days before today to 10 days after today`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}