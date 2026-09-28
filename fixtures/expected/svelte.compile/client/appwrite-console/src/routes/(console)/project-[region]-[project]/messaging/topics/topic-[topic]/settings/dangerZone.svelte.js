import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid, BoxAvatar } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { topic, topicTotal } from '../store';
import DeleteTopic from '../deleteTopic.svelte';

var root = $.from_html(`<p>The topic will be permanently deleted, including all data associated with this topic. This
        action is irreversible.</p>`);

var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<h6 class="u-bold u-trim-1"> </h6>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function DangerZone($$anchor, $$props) {
	$.push($$props, true);

	const $topic = () => $.store_get(topic, '$topic', $$stores);
	const $topicTotal = () => $.store_get(topicTotal, '$topicTotal', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	var fragment = root_3();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Delete topic');

				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_1();
						var text_1 = $.only_child(p_1);

						$.template_effect(() => $.set_text(text_1, `${$topicTotal() ?? ''} subscriber${$topicTotal() === 1 ? '' : 's'}`));
						$.append($$anchor, p_1);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var h6 = root_2();
							var text_2 = $.only_child(h6, true);

							$.template_effect(() => $.set_text(text_2, $topic().name));
							$.append($$anchor, h6);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					event: 'delete_messaging_topic',
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

	DeleteTopic(node_1, {
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