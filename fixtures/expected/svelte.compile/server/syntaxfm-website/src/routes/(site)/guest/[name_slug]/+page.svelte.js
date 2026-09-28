import * as $ from 'svelte/internal/server';
import ShowCard from '$lib/ShowCard.svelte';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let guest = $.derived(() => data.guest);

	if (guest()) {
		$$renderer.push(`<!--[0--><section><header class="svelte-1az1ati"><img${$.attr('src', `https://github.com/${guest().github}.png`)}${$.attr('alt', guest().name)} class="svelte-1az1ati"/> <div><h1 class="svelte-1az1ati">${$.escape(guest().name)}</h1> `);

		if (guest().twitter || guest().github || guest().url) {
			$$renderer.push(`<!--[0--><div class="guest_socials svelte-1az1ati">`);
			HostSocialLink($$renderer, { host: guest() });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></header> <!--[-->`);

		const each_array = $.ensure_array_like(guest().shows);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { Show } = each_array[$$index];

			ShowCard($$renderer, { show: Show, display: 'list' });
		}

		$$renderer.push(`<!--]--></section>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}