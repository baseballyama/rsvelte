import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { InlineCalendar, themes } from '../../index';

export default function DarkTheme($$renderer) {
	const { dark: theme } = themes;

	InlineCalendar($$renderer, { theme });
	$$renderer.push(`<!----> <p>Not your cup of tea? <a${$.attr('href', `${$.stringify(base)}/docs/theme-editor/light`)}>Design your own theme.</a></p>`);
}