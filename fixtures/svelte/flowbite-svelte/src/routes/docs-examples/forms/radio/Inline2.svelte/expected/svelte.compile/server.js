import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Inline2($$renderer) {
	let inline2 = "third";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Radio($$renderer, {
			inline: true,
			value: 'first',
			class: 'me-2',
			get group() {
				return inline2;
			},

			set group($$value) {
				inline2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline 1`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			inline: true,
			value: 'second',
			class: 'me-2',
			get group() {
				return inline2;
			},

			set group($$value) {
				inline2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline 2`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			inline: true,
			value: 'third',
			class: 'me-2',
			get group() {
				return inline2;
			},

			set group($$value) {
				inline2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline checked`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			inline: true,
			value: 'fourth',
			class: 'me-2',
			disabled: true,
			get group() {
				return inline2;
			},

			set group($$value) {
				inline2 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Inline disabled`);
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
}