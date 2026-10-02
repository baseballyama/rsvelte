import * as $ from 'svelte/internal/server';
import HostSocialLink from './HostSocialLink.svelte';

export default function Host($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { guest = false, host } = $$props;

		$$renderer.push(`<div class="person svelte-nnwa4d"><figure class="svelte-nnwa4d"><img${$.attr('src', `https://github.com/${host.github}.png`)}${$.attr('alt', host.name)} role="presentation" class="svelte-nnwa4d"/> <figcaption class="svelte-nnwa4d"><p class="svelte-nnwa4d">`);

		if (guest) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `/guest/${host.slug}`)}>${$.escape(host.name)}</a>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(host.name)}`);
		}

		$$renderer.push(`<!--]--> <span class="host-guest-tag fst-900-i grit svelte-nnwa4d">${$.escape(guest ? 'Guest' : 'Host')}</span></p> <div class="featuring_socials">`);
		HostSocialLink($$renderer, { host });
		$$renderer.push(`<!----></div></figcaption></figure></div>`);
	});
}