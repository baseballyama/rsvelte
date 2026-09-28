import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ModalForm from './ModalForm.svelte';

const code = `
<script>
	import { Modal } from '@svelteuidev/core';
<\/script>

<Modal centered /* other props */>
	<!-- Modal Content -->
</Modal>
`;

export const type = 'demo';
export const configuration = { code };

export default function Modal_demo_centered($$anchor) {
	ModalForm($$anchor, { centered: true });
}