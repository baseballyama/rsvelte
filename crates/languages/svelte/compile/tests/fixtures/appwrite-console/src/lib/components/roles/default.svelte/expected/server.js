import * as $ from 'svelte/internal/server';
import Base from './base.svelte';

export default function Default($$renderer) {
	Base($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="u-flex-vertical u-gap-8"><p>By default, all members are assigned a <span class="u-bold">Developer</span> role. You can
            change this at any time from your organization settings.</p> <p><a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/platform/roles">Learn more</a> about roles.</p></div>`);
		},
		$$slots: { default: true }
	});
}