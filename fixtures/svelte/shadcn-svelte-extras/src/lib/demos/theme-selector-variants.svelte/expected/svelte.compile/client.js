import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ThemeSelector } from '$lib/components/ui/theme-selector';

export default function Theme_selector_variants($$anchor) {
	ThemeSelector($$anchor, { variant: 'ghost' });
}