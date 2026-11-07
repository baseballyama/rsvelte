import * as $ from 'svelte/internal/server';
import FixAllImported from './importing/FixAllImported.svelte';
import FixAllImported2 from './importing/FixAllImported2.svelte';

export default function Codeaction_custom_fix_all_component6($$renderer) {
	FixAllImported($$renderer, {});
	$$renderer.push(`<!----> `);
	FixAllImported2($$renderer, {});
	$$renderer.push(`<!---->`);
}