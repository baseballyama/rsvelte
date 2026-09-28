import * as $ from 'svelte/internal/server';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';

export default function Expand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { expand, setExpand } = $$props;

		$$renderer.push(`<div><h2>Expand</h2> <p>You can change the amount of toasts visible through the <code>visibleToasts</code> prop.</p> <div class="buttons"><button${$.attr('data-active', expand)} class="button">Expand</button> <button${$.attr('data-active', !expand)} class="button">Default</button></div> `);
		CodeBlock($$renderer, { code: `<Toaster expand={${expand}} />` });
		$$renderer.push(`<!----></div>`);
	});
}