import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { user } from '$lib/stores/user';
import Delete from './delete.svelte';

var root = $.from_html(`<span class="u-bold u-trim-1" data-private=""> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DeleteAccount($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your account will be permanently deleted and access will be lost to any of your teams and data. This\n    action is irreversible.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete account');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					$$slots: {
						image: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => $user().name || $user().email);

								AvatarInitials($$anchor, {
									size: 'm',
									get name() {
										return $.get($0);
									}
								});
							}
						},

						title: ($$anchor, $$slotProps) => {
							var span = root();
							var text_2 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_2, $user().name || 'User'));
							$.append($$anchor, span);
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

						var text_3 = $.text('Delete');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Delete(node_1, {
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