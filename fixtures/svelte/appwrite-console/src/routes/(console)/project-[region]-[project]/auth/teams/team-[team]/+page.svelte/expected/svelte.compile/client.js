import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid, AvatarInitials } from '$lib/components';
import { Container } from '$lib/layout';
import { toLocaleDateTime } from '$lib/helpers/date';
import { team } from './store';
import UpdatePrefs from './updatePrefs.svelte';
import UpdateName from './updateName.svelte';
import DangerZone from './dangerZone.svelte';
import { Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16"><!> <!></div>`);
var root_1 = $.from_html(`<div><p> </p> <p> </p></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $team = () => $.store_get(team, '$team', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardGrid(node, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_1 = $.child(div);

					AvatarInitials(node_1, {
						get name() {
							return $team().name;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
						Typography_Title($$anchor, {
							size: 's',
							truncate: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $team().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div);
					$.append($$anchor, div);
				},

				$$slots: {
					default: true,
					aside: ($$anchor, $$slotProps) => {
						var div_1 = root_1();
						var p = $.child(div_1);
						var text_1 = $.only_child(p);
						var p_1 = $.sibling(p, 2);
						var text_2 = $.only_child(p_1);

						$.reset(div_1);

						$.template_effect(
							($0) => {
								$.set_text(text_1, `${$team().total ?? ''} Members`);
								$.set_text(text_2, `Created on ${$0 ?? ''}`);
							},
							[() => toLocaleDateTime($team().$createdAt)]
						);

						$.append($$anchor, div_1);
					}
				}
			});

			var node_3 = $.sibling(node, 2);

			UpdateName(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			UpdatePrefs(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			DangerZone(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}