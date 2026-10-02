import * as $ from 'svelte/internal/server';
import { RadioButton, ButtonGroup } from "flowbite-svelte";
import { ListMusicSolid, OrderedListOutline, ListOutline } from "flowbite-svelte-icons";

export default function RadioButton_1($$renderer) {
	let radioGroup = "notes";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		RadioButton($$renderer, {
			value: 'notes',
			checkedClass: 'outline-4 outline-primary-500',
			get group() {
				return radioGroup;
			},

			set group($$value) {
				radioGroup = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ListMusicSolid($$renderer, { class: 'h-7 w-7' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		RadioButton($$renderer, {
			value: 'numbers',
			checkedClass: 'outline-4 outline-primary-500',
			get group() {
				return radioGroup;
			},

			set group($$value) {
				radioGroup = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				OrderedListOutline($$renderer, { class: 'h-7 w-7' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		RadioButton($$renderer, {
			value: 'bullets',
			checkedClass: 'outline-4 outline-primary-500',
			get group() {
				return radioGroup;
			},

			set group($$value) {
				radioGroup = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ListOutline($$renderer, { class: 'h-7 w-7' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				RadioButton($$renderer, {
					color: 'green',
					outline: true,
					value: 'notes',
					checkedClass: 'outline-4 outline-green-500',
					get group() {
						return radioGroup;
					},

					set group($$value) {
						radioGroup = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ListMusicSolid($$renderer, { class: 'h-7 w-7' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				RadioButton($$renderer, {
					color: 'green',
					outline: true,
					value: 'numbers',
					checkedClass: 'outline-4 outline-green-500',
					get group() {
						return radioGroup;
					},

					set group($$value) {
						radioGroup = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						OrderedListOutline($$renderer, { class: 'h-7 w-7' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				RadioButton($$renderer, {
					color: 'green',
					outline: true,
					value: 'bullets',
					checkedClass: 'outline-4 outline-green-500',
					get group() {
						return radioGroup;
					},

					set group($$value) {
						radioGroup = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ListOutline($$renderer, { class: 'h-7 w-7' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p>List style: ${$.escape(radioGroup)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}