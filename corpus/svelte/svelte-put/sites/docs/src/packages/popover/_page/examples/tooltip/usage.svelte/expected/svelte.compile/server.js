import * as $ from 'svelte/internal/server';
import HintedText from './HintedText.svelte';

function hint($$renderer) {
	$$renderer.push(`<span class="m-0">Built with ♡ using <code>@svelte-put/popover</code> and <code>@floating-ui</code></span>`);
}

export default function Usage($$renderer) {
	$$renderer.push(`<p class="m-0"><span>Hover on</span> `);

	HintedText($$renderer, {
		hint,
		class: 'hl-info cursor-help',
		children: ($$renderer) => {
			$$renderer.push(`<!---->this text ⓘ`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span>for some hinting action (or focus it using keyboard).</span></p>`);
}