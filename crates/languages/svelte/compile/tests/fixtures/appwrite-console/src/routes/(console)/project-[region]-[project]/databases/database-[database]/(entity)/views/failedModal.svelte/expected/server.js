import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Alert } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';

export default function FailedModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = void 0, error, title, header } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title,
				size: 's',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Alert.Inline) {
						$$renderer.push('<!--[-->');

						Alert.Inline($$renderer, {
							title: header,
							status: 'error',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(error)}`);
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
								children: ($$renderer) => {
									$$renderer.push(`<!---->Close`);
								},
								$$slots: { default: true }
							});
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