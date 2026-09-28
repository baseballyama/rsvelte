import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Copy } from '.';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { getProjectEndpoint } from '$lib/helpers/project';

var root = $.from_html(`<span>API endpoint</span>`);

export default function ApiEndpoint($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(getProjectEndpoint);

		Copy($$anchor, {
			get value() {
				return $.get($0);
			},
			copyText: 'Copy endpoint',
			children: ($$anchor, $$slotProps) => {
				Tag($$anchor, {
					size: 'xs',
					variant: 'code',
					children: ($$anchor, $$slotProps) => {
						var span = root();

						$.set_style(span, '', {}, {
							'white-space': 'nowrap',
							overflow: 'hidden',
							'word-break': 'break-all'
						});

						$.append($$anchor, span);
					},

					$$slots: {
						default: true,
						start: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								get icon() {
									return IconDuplicate;
								},
								size: 's',
								slot: 'start'
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}