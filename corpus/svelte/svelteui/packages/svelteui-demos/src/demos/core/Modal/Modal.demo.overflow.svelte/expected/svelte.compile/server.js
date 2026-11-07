import * as $ from 'svelte/internal/server';
import { Modal, Group, Button } from '@svelteuidev/core';

const code = `
// (default) - overflow is handled by modal wrapper
<Modal overflow="outside" />

// overflow is handled by modal body
<Modal overflow="inside" />
`;

export const type = 'demo';
export const configuration = { code };

const content = Array(100).fill(0).map((_, index) => 'Svelte is a complier');

export default function Modal_demo_overflow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let insideOpened = false;
		let outsideOpened = false;
		const closeInside = () => insideOpened = false;
		const closeOutside = () => outsideOpened = false;
		const openInside = () => insideOpened = true;
		const openOutside = () => outsideOpened = true;

		Modal($$renderer, {
			opened: outsideOpened,
			title: 'Please consider this',
			overflow: 'outside',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(content);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let _ = each_array[$$index];

					$$renderer.push(`<p>${$.escape(_)}</p>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			opened: insideOpened,
			title: 'Please consider this',
			overflow: 'inside',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(content);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let _ = each_array_1[$$index_1];

					$$renderer.push(`<p>${$.escape(_)}</p>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Outside overflow`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'cyan',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Inside overflow`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}