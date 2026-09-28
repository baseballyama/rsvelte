import * as $ from 'svelte/internal/server';
import { ButtonGroup, CheckboxButton } from "flowbite-svelte";
import { AppleSolid, FacebookSolid, DiscordSolid, DropboxSolid } from "flowbite-svelte-icons";

export default function CheckboxButton_1($$renderer) {
	let group = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		CheckboxButton($$renderer, {
			value: 'Apple',
			get group() {
				return group;
			},

			set group($$value) {
				group = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				AppleSolid($$renderer, { class: 'me-2 h-6 w-6' });
				$$renderer.push(`<!---->Apple`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		CheckboxButton($$renderer, {
			value: 'Facebook',
			get group() {
				return group;
			},

			set group($$value) {
				group = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				FacebookSolid($$renderer, { class: 'me-2 h-6 w-6' });
				$$renderer.push(`<!---->Facebook`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		CheckboxButton($$renderer, {
			value: 'Discord',
			get group() {
				return group;
			},

			set group($$value) {
				group = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DiscordSolid($$renderer, { class: 'me-2 h-6 w-6' });
				$$renderer.push(`<!---->Discord`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		CheckboxButton($$renderer, {
			value: 'Dropbox',
			get group() {
				return group;
			},

			set group($$value) {
				group = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DropboxSolid($$renderer, { class: 'me-2 h-6 w-6' });
				$$renderer.push(`<!---->Dropbox`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				CheckboxButton($$renderer, {
					value: 'Apple',
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						AppleSolid($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!---->Apple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CheckboxButton($$renderer, {
					value: 'Facebook',
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						FacebookSolid($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!---->Facebook`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CheckboxButton($$renderer, {
					value: 'Discord',
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						DiscordSolid($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!---->Discord`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				CheckboxButton($$renderer, {
					value: 'Dropbox',
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						DropboxSolid($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!---->Dropbox`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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