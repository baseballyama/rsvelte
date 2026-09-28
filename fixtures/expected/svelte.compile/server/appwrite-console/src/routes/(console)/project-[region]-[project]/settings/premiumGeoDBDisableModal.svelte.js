import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';

export default function PremiumGeoDBDisableModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, addonId } = $$props;
		let error = null;
		let submitting = false;

		async function handleSubmit() {
			submitting = true;
			error = null;

			try {
				await sdk.forConsoleIn(page.params.region).projects.deleteAddon({ projectId: page.params.project, addonId });

				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.PROJECT)
				]);

				addNotification({
					message: 'Premium Geo DB addon will be removed at the end of your current billing cycle',
					type: 'success'
				});

				show = false;
			} catch(e) {
				error = e.message;
			} finally {
				submitting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleSubmit,
				title: 'Disable Premium Geo DB',
				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<p class="text">Are you sure you want to disable the Premium Geo DB addon? The addon will remain active
        until the end of your current billing cycle and will not be renewed.</p>`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								secondary: true,
								submit: true,
								disabled: submitting,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disable Premium Geo DB`);
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