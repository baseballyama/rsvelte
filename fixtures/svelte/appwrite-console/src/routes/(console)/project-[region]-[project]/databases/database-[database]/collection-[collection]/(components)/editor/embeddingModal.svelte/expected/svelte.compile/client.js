import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import { Button, InputTextarea } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { Layout, Icon } from '@appwrite.io/pink-svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';

var root = $.from_html(`<!> <span class="u-color-text-offline">Embeddings are generated using Embedding Gemma model</span>`, 1);

var root_1 = $.from_html(
	`<p class="u-margin-block-end-8">Enter the content you want to convert into a vector. This will allow semantic search and
        similarity matching.</p> <!> <!>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function EmbeddingModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false);
	let content = $.state('');
	let generating = $.state(false);
	const MAX_LENGTH = 25000;

	async function generate() {
		if (!$.get(content).trim()) return;

		$.set(generating, true);

		try {
			const response = await sdk.forProject(page.params.region, page.params.project).embeddings.createTextEmbeddings({ texts: [$.get(content).trim()] });
			const embedding = response?.embeddings?.[0]?.embedding;

			if (embedding?.length) {
				$$props.onGenerate(embedding);
				$.set(content, '');
				show(false);
			} else {
				const error = response?.embeddings?.[0]?.error;

				throw new Error(error || 'Failed to generate embeddings');
			}
		} catch(e) {
			addNotification({
				type: 'error',
				message: e instanceof Error ? e.message : String(e)
			});
		} finally {
			$.set(generating, false);
		}
	}

	$.user_effect(() => {
		if (!show()) {
			$.set(content, '');
		}
	});

	Modal($$anchor, {
		size: 'm',
		title: 'Text for embedding',
		onSubmit: generate,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 2);

			InputTextarea(node, {
				id: 'embedding-content',
				label: 'Content to embed',
				placeholder: 'Paste or type your text here...',
				maxlength: MAX_LENGTH,
				autofocus: true,
				required: true,
				get value() {
					return $.get(content);
				},

				set value($$value) {
					$.set(content, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					gap: 'xs',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Icon(node_2, {
							get icon() {
								return IconInfo;
							},
							size: 's'
						});

						$.next(2);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_3 = root_2();
				var node_3 = $.first_child(fragment_3);

				Button(node_3, {
					secondary: true,
					get disabled() {
						return $.get(generating);
					},
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => $.get(generating) || !$.get(content).trim());

					Button(node_4, {
						submit: true,
						get disabled() {
							return $.get($0);
						},
						submissionLoader: true,
						get forceShowLoader() {
							return $.get(generating);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Generate');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_3);
			}
		}
	});

	$.pop();
}