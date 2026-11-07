import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Inline($$renderer) {
	let inline1 = "second";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex gap-3">`);

		Radio($$renderer, {
			value: 'first',
			get group() {
				return inline1;
			},

			set group($$value) {
				inline1 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline 1`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			value: 'second',
			get group() {
				return inline1;
			},

			set group($$value) {
				inline1 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline 2 checked`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			value: 'third',
			get group() {
				return inline1;
			},

			set group($$value) {
				inline1 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline 3`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			value: 'fourth',
			disabled: true,
			get group() {
				return inline1;
			},

			set group($$value) {
				inline1 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline disabled`);
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