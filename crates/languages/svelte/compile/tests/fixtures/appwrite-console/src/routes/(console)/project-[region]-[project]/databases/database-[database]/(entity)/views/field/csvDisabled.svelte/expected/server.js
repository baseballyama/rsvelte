import * as $ from 'svelte/internal/server';
import { Tooltip } from '@appwrite.io/pink-svelte';

export default function CsvDisabled($$renderer, $$props) {
	const { children } = $$props;

	Tooltip($$renderer, {
		maxWidth: '12rem',
		portal: true,
		children: ($$renderer) => {
			$$renderer.push(`<div>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		},

		$$slots: {
			default: true,
			tooltip: ($$renderer) => {
				$$renderer.push(`<div slot="tooltip">This action is disabled during import.</div>`);
			}
		}
	});
}