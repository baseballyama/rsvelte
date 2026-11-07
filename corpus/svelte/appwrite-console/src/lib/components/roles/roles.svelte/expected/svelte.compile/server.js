import * as $ from 'svelte/internal/server';
import Base from './base.svelte';

export default function Roles($$renderer, $$props) {
	const { isProjectSpecific = false } = $$props;

	Base($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="u-flex-vertical u-gap-8"><p class="u-bold">Roles</p> <p>${$.escape(isProjectSpecific
				? 'Owner, Developer, Editor and Analyst.'
				: 'Owner, Developer, Editor, Analyst and Billing.')}</p> <p><a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/platform/roles">Learn more</a> about roles.</p></div>`);
		},
		$$slots: { default: true }
	});
}