import * as $ from 'svelte/internal/server';
import { StepIndicator, Radio, Label } from "flowbite-svelte";

export default function Sizes($$renderer) {
	const sizes = ["xs", "sm", "md", "lg", "xl"];
	let size = "xs";
	let currentStep = 2;
	let steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="my-4">`);

		StepIndicator($$renderer, {
			currentStep,
			steps,
			get size() {
				return size;
			},

			set size($$value) {
				size = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <div class="flex flex-wrap space-x-2">`);

		Label($$renderer, {
			class: 'mb-4 w-full font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Size`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(sizes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let sizeOption = each_array[$$index];

			Radio($$renderer, {
				class: 'my-1',
				classes: { label: "w-24" },
				name: 'size',
				value: sizeOption,
				get group() {
					return size;
				},

				set group($$value) {
					size = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(sizeOption)}`);
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