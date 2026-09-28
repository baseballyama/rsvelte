import * as $ from 'svelte/internal/server';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Confirm } from '$lib/components';
import { Typography } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';

export default function DeleteDomainModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = void 0, selectedProxyRule } = $$props;
		let error = null;

		async function deleteDomain() {
			try {
				await sdk.forProject(page.params.region, page.params.project).proxy.deleteRule({ ruleId: selectedProxyRule.$id });
				await invalidate(Dependencies.SITES_DOMAINS);
				show = false;
				addNotification({ type: 'success', message: `Domain has been deleted` });
				trackEvent(Submit.DomainDelete);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.DomainDelete);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Confirm($$renderer, {
				title: 'Delete domain',
				onSubmit: deleteDomain,
				confirmDeletion: true,
				get open() {
					return show;
				},

				set open($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (selectedProxyRule) {
						$$renderer.push('<!--[0-->');

						if (Typography.Text) {
							$$renderer.push('<!--[-->');

							Typography.Text($$renderer, {
								variant: 'm-400',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Are you sure you want to delete this domain? You will no longer be able to view your
            site by visiting:`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Typography.Text) {
							$$renderer.push('<!--[-->');

							Typography.Text($$renderer, {
								variant: 'm-500',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedProxyRule.domain)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
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