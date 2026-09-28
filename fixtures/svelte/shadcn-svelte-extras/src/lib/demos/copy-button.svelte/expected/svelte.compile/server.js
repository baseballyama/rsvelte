import * as $ from 'svelte/internal/server';
import { CopyButton } from '$lib/components/ui/copy-button';

export default function Copy_button($$renderer) {
	CopyButton($$renderer, { text: 'Hello, World!' });
}