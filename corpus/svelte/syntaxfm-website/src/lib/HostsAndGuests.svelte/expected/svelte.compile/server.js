import * as $ from 'svelte/internal/server';
import Host from '$lib/hosts/Host.svelte';

export default function HostsAndGuests($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { guests = [], hosts = [] } = $$props;

		$$renderer.push(`<div class="guests-and-hosts svelte-1batlym">`);

		if (guests?.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(guests);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { Guest } = each_array[$$index];

				Host($$renderer, {
					host: {
						name: Guest.name,
						github: Guest?.github,
						twitter: Guest?.twitter,
						slug: Guest?.name_slug
					},
					guest: true
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (hosts.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_1 = $.ensure_array_like(hosts);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let host = each_array_1[$$index_1];

				Host($$renderer, {
					host: {
						name: host.name || host.username || '',
						github: host.username,
						twitter: host.twitter
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			Host($$renderer, {
				host: { name: 'Wes Bos', github: 'wesbos', twitter: 'wesbos' }
			});

			$$renderer.push(`<!----> `);

			Host($$renderer, {
				host: {
					name: 'Scott Tolinski',
					github: 'stolinski',
					twitter: 'stolinski'
				}
			});

			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}