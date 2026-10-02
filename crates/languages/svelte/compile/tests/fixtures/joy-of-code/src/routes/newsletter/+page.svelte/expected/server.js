import * as $ from 'svelte/internal/server';
import Heading from '$lib/ui/heading.svelte';
import Newsletter from '$lib/ui/newsletter.svelte';

export default function _page($$renderer) {
	$.head('12eivhs', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Newsletter</title>`);
		});

		$$renderer.push(`<meta content="Subscribe for updates and tasty web development treats." name="description"/>`);
	});

	Heading($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Newsletter`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="newsletter svelte-12eivhs">`);
	Newsletter($$renderer, {});
	$$renderer.push(`<!----></div>`);
}