import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_demo($$anchor) {
	Textarea($$anchor, { placeholder: 'Type your message here.' });
}