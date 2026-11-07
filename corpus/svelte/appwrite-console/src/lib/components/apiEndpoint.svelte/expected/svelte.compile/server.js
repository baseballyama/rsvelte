import * as $ from 'svelte/internal/server';
import { Copy } from '.';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { getProjectEndpoint } from '$lib/helpers/project';

export default function ApiEndpoint($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Copy($$renderer, {
			value: getProjectEndpoint(),
			copyText: 'Copy endpoint',
			children: ($$renderer) => {
				Tag($$renderer, {
					size: 'xs',
					variant: 'code',
					children: ($$renderer) => {
						$$renderer.push(`<span${$.attr_style('', {
							'white-space': 'nowrap',
							overflow: 'hidden',
							'word-break': 'break-all'
						})}>API endpoint</span>`);
					},

					$$slots: {
						default: true,
						start: ($$renderer) => {
							Icon($$renderer, { icon: IconDuplicate, size: 's', slot: 'start' });
						}
					}
				});
			},
			$$slots: { default: true }
		});
	});
}