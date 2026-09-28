import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_disabled($$anchor) {
	Textarea($$anchor, { disabled: true, placeholder: 'Type your message here.' });
}