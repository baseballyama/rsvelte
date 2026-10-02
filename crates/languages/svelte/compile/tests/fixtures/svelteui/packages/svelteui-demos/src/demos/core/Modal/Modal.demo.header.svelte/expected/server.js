import * as $ from 'svelte/internal/server';
import { Modal, Group, Button } from '@svelteuidev/core';

const code = `
<script>
	import { Modal } from '@svelteuidev/core';
<\/script>

<Modal withCloseButton={false}>
	Modal without header, press escape or click on overlay to close
</Modal>
`;

export const type = 'demo';
export const configuration = { code };

export default function Modal_demo_header($$renderer) {
	let opened;

	Modal($$renderer, {
		opened,
		withCloseButton: false,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Modal without header, press escape or click on overlay to close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Modal`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}