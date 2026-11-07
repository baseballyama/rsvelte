import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import Delete from './deleteModal.svelte';
import { func } from '../store';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<h6 class="u-bold u-trim-1"> </h6>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function DangerZone($$anchor, $$props) {
	$.push($$props, true);

	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The function will be permanently deleted, including all deployments associated with it.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete function');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var p = root();
						var text_2 = $.only_child(p);

						$.template_effect(($0) => $.set_text(text_2, `Last updated: ${$0 ?? ''}`), [() => toLocaleDateTime($func().$updatedAt)]);
						$.append($$anchor, p);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var h6 = root_1();
							var text_3 = $.only_child(h6, true);

							$.template_effect(() => $.set_text(text_3, $func().name));
							$.append($$anchor, h6);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					$$events: { click: () => showDelete = true },
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

	Delete(node_1, {
		get projectFunction() {
			return $func();
		},

		get showDelete() {
			return showDelete;
		},

		set showDelete($$value) {
			showDelete = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}