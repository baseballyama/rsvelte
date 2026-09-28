import * as $ from 'svelte/internal/server';
import { StepIndicator, Radio, Label } from "flowbite-svelte";

export default function Colors($$renderer) {
	const colors = [
		"primary",
		"secondary",
		"gray",
		"red",
		"yellow",
		"green",
		"indigo",
		"purple",
		"pink",
		"blue"
	];

	let color = "green";
	let currentStep = 2;
	let steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="my-4">`);

		StepIndicator($$renderer, {
			currentStep,
			steps,
			get color() {
				return color;
			},

			set color($$value) {
				color = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <div class="flex flex-wrap space-x-2">`);

		Label($$renderer, {
			class: 'mb-4 w-full font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Color`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(colors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let colorOption = each_array[$$index];

			Radio($$renderer, {
				class: 'my-1',
				classes: { label: "w-24" },
				name: 'color',
				color: colorOption,
				value: colorOption,
				get group() {
					return color;
				},

				set group($$value) {
					color = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(colorOption)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}