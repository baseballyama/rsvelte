import * as $ from 'svelte/internal/server';
import { Datepicker, P, Button } from "flowbite-svelte";

export default function ActionSlot($$renderer) {
	let selectedDate = undefined;
	let lastAction = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mb-64 md:w-1/2">`);

		{
			function actionSlot($$renderer, { selectedDate, handleClear, handleApply }) {
				$$renderer.push(`<div class="mt-2 flex gap-2">`);

				Button($$renderer, {
					size: 'sm',
					onclick: handleClear,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clear`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					onclick: () => selectedDate && handleApply(selectedDate),
					disabled: !selectedDate,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Apply`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					onclick: () => console.log("Selection:", selectedDate || "None"),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show Selection`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			Datepicker($$renderer, {
				autohide: false,
				get value() {
					return selectedDate;
				},

				set value($$value) {
					selectedDate = $$value;
					$$settled = false;
				},
				actionSlot,
				$$slots: { actionSlot: true }
			});
		}

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Selected date: ${$.escape(selectedDate ? selectedDate.toLocaleDateString() : "None")}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-2',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Last action: `);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> Lorem ipsum dolor sit amet consectetur adipisicing elit. In quidem rerum, optio adipisci illum at earum fugiat eius minus quae! Quisquam cumque architecto facilis? Tempora ipsum perferendis quo
explicabo minus.`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}