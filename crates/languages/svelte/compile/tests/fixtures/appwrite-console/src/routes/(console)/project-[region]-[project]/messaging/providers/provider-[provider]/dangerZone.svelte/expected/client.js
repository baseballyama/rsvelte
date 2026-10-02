import 'svelte/internal/disclose-version';
import { page } from '$app/state';
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';
import * as $ from 'svelte/internal/client';
import { CardGrid, BoxAvatar } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { provider } from './store';
import { toLocaleDateTime } from '$lib/helpers/date';
import DeleteProvider from './deleteProvider.svelte';

let showDelete = writable(false);

export const promptDeleteProvider = (id) => {
	showDelete.set(true);
	goto(`${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${id}`);
};

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<h6 class="u-bold u-trim-1"> </h6>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function DangerZone($$anchor, $$props) {
	$.push($$props, true);

	const $provider = () => $.store_get(provider, '$provider', $$stores);
	const $showDelete = () => $.store_get(showDelete, '$showDelete', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_2();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The provider\'s instance will be permanently deleted. This action is irreversible.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete provider');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var p = root();
						var text_2 = $.only_child(p);

						$.template_effect(($0) => $.set_text(text_2, `Last updated: ${$0 ?? ''}`), [() => toLocaleDateTime($provider().$updatedAt)]);
						$.append($$anchor, p);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var h6 = root_1();
							var text_3 = $.only_child(h6, true);

							$.template_effect(() => $.set_text(text_3, $provider().name));
							$.append($$anchor, h6);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					event: 'delete_messaging_provider',
					$$events: { click: () => $.store_set(showDelete, true) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Delete');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	DeleteProvider(node_1, {
		get showDelete() {
			$.mark_store_binding();

			return $showDelete();
		},

		set showDelete($$value) {
			$.store_set(showDelete, $$value);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}