import * as $ from 'svelte/internal/server';
import Icon from '$lib/Icon.svelte';

export default function HostSocialLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { host } = $$props;

		// if url is not prefixed with https, add it
		const httpHostUrl = host.url && (/https?\:/).test(host.url) ? host.url : `https://${host.url}`;

		if (host.twitter) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `https://x.com/${host.twitter}`)} target="_blank" class="social-icon svelte-c97hjm">`);
			Icon($$renderer, { name: 'x', title: `${host.name} on X` });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (host.github) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `https://github.com/${host.github}`)} target="_blank" class="social-icon svelte-c97hjm">`);
			Icon($$renderer, { name: 'github', title: `${host.name} on GitHub` });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (host.url) {
			$$renderer.push(`<!--[0--><a${$.attr('href', httpHostUrl)} target="_blank" class="social-icon svelte-c97hjm">`);
			Icon($$renderer, { name: 'monitor', title: `${host.name}'s website'` });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}