import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/elements/forms/button.svelte';
import { canWriteKeys } from '$lib/stores/roles';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

export default function Action($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteKeys = () => $.store_get(canWriteKeys, '$canWriteKeys', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/create`);

				Button($$anchor, {
					get href() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Create API key');

						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						start: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								get icon() {
									return IconPlus;
								},
								slot: 'start',
								size: 's'
							});
						}
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($canWriteKeys()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}