import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import StringValue from './StringValue.svelte';

export default function URLView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = new URL(''),
			key,
			type,
			path,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let hash = $.derived(() => value.hash),
			host = $.derived(() => value.host),
			hostname = $.derived(() => value.hostname),
			href = $.derived(() => value.href),
			origin = $.derived(() => value.origin),
			searchParams = $.derived(() => value.searchParams),
			password = $.derived(() => value.password),
			pathname = $.derived(() => value.pathname),
			port = $.derived(() => value.port),
			protocol = $.derived(() => value.protocol),
			username = $.derived(() => value.username);

		let entries = $.derived(() => Object.entries({
			protocol: protocol(),
			username: username(),
			password: password(),
			host: host(),
			port: port(),
			pathname: pathname(),
			hash: hash(),
			hostname: hostname(),
			origin: origin(),
			href: href(),
			searchParams: searchParams()
		}).filter((prop) => !!prop[1].toString()));

		{
			function valuePreview($$renderer) {
				StringValue($$renderer, { type, value: value.toString() });
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{ length: entries().length, showLength: false },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(entries());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let [key, value] = each_array[i];

							Entry($$renderer, {
								i,
								children: ($$renderer) => {
									Node($$renderer, { value, key, path });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}