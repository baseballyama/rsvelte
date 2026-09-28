import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function ListGroup($$renderer) {
	let technology = "svelte";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Technology <span class="capitalize">${$.escape(technology)}</span></p> <ul class="w-48 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800"><li>`);

		Radio($$renderer, {
			classes: { label: "p-3" },
			value: 'svelte',
			get group() {
				return technology;
			},

			set group($$value) {
				technology = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Svelte`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li> <li>`);

		Radio($$renderer, {
			classes: { label: "p-3" },
			value: 'vue js',
			get group() {
				return technology;
			},

			set group($$value) {
				technology = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Vue JS`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li> <li>`);

		Radio($$renderer, {
			classes: { label: "p-3" },
			value: 'react',
			get group() {
				return technology;
			},

			set group($$value) {
				technology = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->React`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li> <li>`);

		Radio($$renderer, {
			classes: { label: "p-3" },
			value: 'angular',
			get group() {
				return technology;
			},

			set group($$value) {
				technology = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Angular`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li></ul>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}