import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from '$lib/components/ui/copy-button';

export default function Copy_button($$anchor) {
	CopyButton($$anchor, { text: 'Hello, World!' });
}