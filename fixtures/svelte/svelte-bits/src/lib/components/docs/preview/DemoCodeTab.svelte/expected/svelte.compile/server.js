import * as $ from 'svelte/internal/server';
import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
import CliInstall from './CliInstall.svelte';
import CodeBlock from './CodeBlock.svelte';

export default function DemoCodeTab($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { slug, usage, source } = $$props;

		/** Mirrors registry installs: omit internal `<!-- @svelte-bits -->` metadata. */
		const sourceForDocs = $.derived(() => stripSvelteBitsHeader(source));

		CliInstall($$renderer, { slug });
		$$renderer.push(`<!----> <h3 class="demo-title-extra">Usage</h3> `);
		CodeBlock($$renderer, { code: usage, language: 'svelte' });
		$$renderer.push(`<!----> <h3 class="demo-title-extra">Component source</h3> `);
		CodeBlock($$renderer, { code: sourceForDocs(), language: 'svelte' });
		$$renderer.push(`<!---->`);
	});
}