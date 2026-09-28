import * as $ from 'svelte/internal/server';
import { timer } from '$lib/actions/timer';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';

export default function LogsTimer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { deployment } = $$props;
		let effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				direction: 'row',
				alignItems: 'center',
				inline: true,
				children: ($$renderer) => {
					if (['processing', 'building', 'finalizing'].includes(effectiveStatus())) {
						$$renderer.push('<!--[0-->');

						if (Typography.Code) {
							$$renderer.push('<!--[-->');

							Typography.Code($$renderer, {
								color: '--fgcolor-neutral-secondary',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											alignItems: 'center',
											inline: true,
											children: ($$renderer) => {
												$$renderer.push(`<p></p> `);
												Spinner($$renderer, { size: 's' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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

						if (Typography.Code) {
							$$renderer.push('<!--[-->');

							Typography.Code($$renderer, {
								color: '--fgcolor-neutral-secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(formatTimeDetailed(deployment.buildDuration))}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}