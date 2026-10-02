import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import DeleteTeam from './deleteTeam.svelte';
import { team } from './store';

var root = $.from_html(`<h6 class="u-bold u-trim-1"> </h6> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DangerZone($$anchor, $$props) {
	$.push($$props, true);

	const $team = () => $.store_get(team, '$team', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The team will be permanently deleted, including all data associated with this team. This action is\n    irreversible.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete team');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					$$slots: {
						image: ($$anchor, $$slotProps) => {
							AvatarInitials($$anchor, {
								get name() {
									return $team().name;
								}
							});
						},

						title: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var h6 = $.first_child(fragment_3);
							var text_2 = $.only_child(h6, true);
							var span = $.sibling(h6, 2);
							var text_3 = $.only_child(span);

							$.template_effect(() => {
								$.set_text(text_2, $team().name);
								$.set_text(text_3, `${$team().total ?? ''} Members`);
							});

							$.append($$anchor, fragment_3);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					event: 'delete_team',
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

	DeleteTeam(node_1, {
		get team() {
			return $team();
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