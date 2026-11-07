import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Colors($$renderer) {
	let colors = "text-purple-500";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p${$.attr_class(`mb-4 font-semibold ${$.stringify(colors)}`)}>Select color</p> <div class="flex gap-4">`);

		Radio($$renderer, {
			color: 'red',
			value: 'text-red-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Red`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			color: 'green',
			value: 'text-green-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Green`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			color: 'purple',
			value: 'text-purple-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Purple`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			color: 'teal',
			value: 'text-teal-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Teal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			color: 'yellow',
			value: 'text-yellow-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Yellow`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			color: 'orange',
			value: 'text-orange-500',
			get group() {
				return colors;
			},

			set group($$value) {
				colors = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Orange`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}