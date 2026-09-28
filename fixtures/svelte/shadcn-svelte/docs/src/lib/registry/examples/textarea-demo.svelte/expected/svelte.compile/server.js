import * as $ from 'svelte/internal/server';
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_demo($$renderer) {
	Textarea($$renderer, { placeholder: 'Type your message here.' });
}