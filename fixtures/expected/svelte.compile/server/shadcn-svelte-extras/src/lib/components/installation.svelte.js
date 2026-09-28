import * as $ from 'svelte/internal/server';
import JsrepoCommand from './docs/jsrepo-command.svelte';
import { h2 as MarkdownH2 } from '$lib/components/mdsx';

export default function Installation($$renderer, $$props) {
	let { specifier } = $$props;

	MarkdownH2($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Installation`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	JsrepoCommand($$renderer, { command: 'execute', args: ['jsrepo', 'add', specifier] });
	$$renderer.push(`<!---->`);
}