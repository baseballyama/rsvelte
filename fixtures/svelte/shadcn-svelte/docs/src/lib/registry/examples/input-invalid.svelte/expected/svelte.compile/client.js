import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/registry/ui/input/index.js";

export default function Input_invalid($$anchor) {
	Input($$anchor, {
		'aria-invalid': true,
		type: 'email',
		placeholder: 'email',
		value: 'shadcn@example',
		class: 'max-w-sm'
	});
}