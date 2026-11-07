import * as $ from 'svelte/internal/server';
import ModalForm from './ModalForm.svelte';

const code = `
<script>
	import { Modal, Group, Button } from '@svelteuidev/core';

	let opened = false;
<\/script>

<!-- This component must be wrapped in SvelteUIProvider (on the application level)
  or you must specify a target with the target prop --!>
<Modal {opened} on:close={closeModal} title="Introduce yourself!">
	<!-- Modal Content -->
</Modal>

<Group position="center">
	<Button on:click={() => (opened = true)}>Open Modal</Button>
</Group>
`;

export const type = 'demo';
export const configuration = { code };

export default function Modal_demo_usage($$renderer) {
	ModalForm($$renderer, {});
}