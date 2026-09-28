import * as $ from 'svelte/internal/server';
import BaseModal from '../BaseModal.svelte';

export default function TestModalWithContent($$renderer, $$props) {
	let { isOpen, onClose, title = 'Test Modal' } = $$props;

	BaseModal($$renderer, {
		isOpen,
		onClose,
		title,
		children: ($$renderer) => {
			$$renderer.push(`<div>Modal Content</div>`);
		},
		$$slots: { default: true }
	});
}