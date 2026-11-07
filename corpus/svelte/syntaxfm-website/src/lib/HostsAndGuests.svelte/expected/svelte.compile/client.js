import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Host from '$lib/hosts/Host.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="guests-and-hosts svelte-1batlym"><!> <!></div>`);

export default function HostsAndGuests($$anchor, $$props) {
	$.push($$props, true);

	let guests = $.prop($$props, 'guests', 19, () => []),
		hosts = $.prop($$props, 'hosts', 19, () => []);

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, guests, $.index, ($$anchor, $$item) => {
				let Guest = () => $.get($$item).Guest;

				{
					let $0 = $.derived(() => ({
						name: Guest().name,
						github: Guest()?.github,
						twitter: Guest()?.twitter,
						slug: Guest()?.name_slug
					}));

					Host($$anchor, {
						get host() {
							return $.get($0);
						},
						guest: true
					});
				}
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (guests()?.length > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 17, hosts, $.index, ($$anchor, host) => {
				{
					let $0 = $.derived(() => ({
						name: $.get(host).name || $.get(host).username || '',
						github: $.get(host).username,
						twitter: $.get(host).twitter
					}));

					Host($$anchor, {
						get host() {
							return $.get($0);
						}
					});
				}
			});

			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Host(node_4, {
				host: { name: 'Wes Bos', github: 'wesbos', twitter: 'wesbos' }
			});

			var node_5 = $.sibling(node_4, 2);

			Host(node_5, {
				host: {
					name: 'Scott Tolinski',
					github: 'stolinski',
					twitter: 'stolinski'
				}
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_2, ($$render) => {
			if (hosts().length > 0) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}