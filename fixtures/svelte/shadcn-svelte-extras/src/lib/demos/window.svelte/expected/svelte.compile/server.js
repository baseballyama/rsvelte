import * as $ from 'svelte/internal/server';
import { Window } from '$lib/components/ui/window';

export default function Window_1($$renderer) {
	Window($$renderer, {
		class: 'm-6 max-w-xl',
		children: ($$renderer) => {
			$$renderer.push(`<strong># Window</strong> <p>An awesome styled window component.</p>`);
		},
		$$slots: { default: true }
	});
}