import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/registry/ui/input/index.js";

export default function Input_disabled($$anchor) {
	Input($$anchor, {
		disabled: true,
		type: 'email',
		placeholder: 'Email',
		class: 'max-w-sm'
	});
}