import * as $ from 'svelte/internal/server';
import { InlineCalendar } from '../../index';
import { base } from '$app/paths';

export default function CustomTheme($$renderer) {
	const theme = {
		calendar: { colors: { background: { highlight: 'purple' } } }
	};

	InlineCalendar($$renderer, { theme });
	$$renderer.push(`<!----> <p>See <a${$.attr('href', `${$.stringify(base)}/docs/theme-editor/light`)}>theme-editor page</a> to design your own theme.</p>`);
}