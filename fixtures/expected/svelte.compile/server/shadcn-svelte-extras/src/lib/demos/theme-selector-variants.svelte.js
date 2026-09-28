import * as $ from 'svelte/internal/server';
import { ThemeSelector } from '$lib/components/ui/theme-selector';

export default function Theme_selector_variants($$renderer) {
	ThemeSelector($$renderer, { variant: 'ghost' });
}