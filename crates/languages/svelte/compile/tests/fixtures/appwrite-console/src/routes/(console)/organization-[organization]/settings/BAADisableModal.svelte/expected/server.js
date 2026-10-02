import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';

export default function BAADisableModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, addonId } = $$props;
		let error = null;
		let submitting = false;

		async function handleSubmit() {
			submitting = true;
			error = null;

			try {
				await sdk.forConsole.organizations.deleteAddon({
					organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					addonId
				});

				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.ORGANIZATION)
				]);

				addNotification({
					message: 'BAA addon will be removed at the end of your current billing cycle',
					type: 'success'
				});

				trackEvent(Submit.BAAAddonDisable);
				show = false;
			} catch(e) {
				error = e.message;
				trackError(e, Submit.BAAAddonDisable);
			} finally {
				submitting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleSubmit,
				title: 'Disable BAA',
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
					$$renderer.push(`<p class="text">Are you sure you want to disable the BAA addon? The addon will remain active until the end
        of your current billing cycle and will not be renewed.</p>`);
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
									$$renderer.push(`<!---->Disable BAA`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}