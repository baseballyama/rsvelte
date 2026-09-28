import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import { Button, InputTextarea } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { Layout, Icon } from '@appwrite.io/pink-svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';

export default function EmbeddingModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, onGenerate } = $$props;
		let content = '';
		let generating = false;
		const MAX_LENGTH = 25000;

		async function generate() {
			if (!content.trim()) return;

			generating = true;

			try {
				const response = await sdk.forProject(page.params.region, page.params.project).embeddings.createTextEmbeddings({ texts: [content.trim()] });
				const embedding = response?.embeddings?.[0]?.embedding;

				if (embedding?.length) {
					onGenerate(embedding);
					content = '';
					show = false;
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
				generating = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				size: 'm',
				title: 'Text for embedding',
				onSubmit: generate,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<p class="u-margin-block-end-8">Enter the content you want to convert into a vector. This will allow semantic search and
        similarity matching.</p> `);

					InputTextarea($$renderer, {
						id: 'embedding-content',
						label: 'Content to embed',
						placeholder: 'Paste or type your text here...',
						maxlength: MAX_LENGTH,
						autofocus: true,
						required: true,
						get value() {
							return content;
						},

						set value($$value) {
							content = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							gap: 'xs',
							alignItems: 'center',
							children: ($$renderer) => {
								Icon($$renderer, { icon: IconInfo, size: 's' });
								$$renderer.push(`<!----> <span class="u-color-text-offline">Embeddings are generated using Embedding Gemma model</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								disabled: generating,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								disabled: generating || !content.trim(),
								submissionLoader: true,
								forceShowLoader: generating,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Generate`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}