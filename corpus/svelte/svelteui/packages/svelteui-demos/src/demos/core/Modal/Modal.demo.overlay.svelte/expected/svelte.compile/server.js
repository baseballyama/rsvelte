import * as $ from 'svelte/internal/server';
import { useSvelteUITheme } from '@svelteuidev/core';
import ModalForm from './ModalForm.svelte';

const code = `
<script>
    import { Modal, useSvelteUITheme } from '@svelteuidev/core';
    
    const theme = useSvelteUITheme();
<\/script>
    
<Modal
    overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
    overlayOpacity={0.55}
    overlayBlur={3}
>
    {/* Modal content */}
</Modal>
`;

export const type = 'demo';
export const configuration = { code };

export default function Modal_demo_overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();

		ModalForm($$renderer, {
			overlayColor: theme.colors.gray200.value,
			overlayOpacity: 0.55,
			overlayBlur: 3
		});
	});
}