import * as $ from 'svelte/internal/server';
import { theme_maker } from '$state/theme';

export default function ThemeToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button class="svelte-1flis1a">🎨</button>`);
	});
}