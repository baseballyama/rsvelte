import * as $ from 'svelte/internal/server';
import { useRename } from './rename.svelte.js';

export default function Rename_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		useRename();

		let { children } = $$props;

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}