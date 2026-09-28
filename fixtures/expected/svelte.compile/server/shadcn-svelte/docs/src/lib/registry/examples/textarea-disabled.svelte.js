import * as $ from 'svelte/internal/server';
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_disabled($$renderer) {
	Textarea($$renderer, { disabled: true, placeholder: 'Type your message here.' });
}