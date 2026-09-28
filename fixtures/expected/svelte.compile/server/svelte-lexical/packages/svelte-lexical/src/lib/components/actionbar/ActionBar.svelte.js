import * as $ from 'svelte/internal/server';
import ImportButton from './ImportButton.svelte';
import ExportButton from './ExportButton.svelte';
import ReadonlyButton from './ReadonlyButton.svelte';

export default function ActionBar($$renderer) {
	$$renderer.push(`<div class="actions">`);
	ImportButton($$renderer, {});
	$$renderer.push(`<!----> `);
	ExportButton($$renderer, {});
	$$renderer.push(`<!----> `);
	ReadonlyButton($$renderer, {});
	$$renderer.push(`<!----></div>`);
}