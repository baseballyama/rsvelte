import * as $ from 'svelte/internal/server';
import { Snippet } from '$lib/components/ui/snippet';

export default function Snippet_multiline($$renderer) {
	Snippet($$renderer, {
		text: ['npx jsrepo add', 'npx jsrepo add ui/snippet'],
		class: 'max-w-[300px]'
	});
}