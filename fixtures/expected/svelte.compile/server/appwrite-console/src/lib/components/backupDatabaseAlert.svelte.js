import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { currentPlan, organization } from '$lib/stores/organization';
import { HeaderAlert } from '$lib/layout';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { hideNotification } from '$lib/helpers/notifications';
import { backupsBannerId, showPolicyAlert } from '$lib/stores/database';
import { IconX } from '@appwrite.io/pink-icons-svelte';
import { Icon } from '@appwrite.io/pink-svelte';

export default function BackupDatabaseAlert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function handleClose() {
			showPolicyAlert.set(false);
			hideNotification(backupsBannerId);
		}

		if ($.store_get($$store_subs ??= {}, '$showPolicyAlert', showPolicyAlert) && isCloud && $.store_get($$store_subs ??= {}, '$organization', organization)?.$id && page.url.pathname.match(/\/databases\/database-[^/]+$/)) {
			$$renderer.push('<!--[0-->');

			const areBackupsAvailable = $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.backupsEnabled;

			const subtitle = !areBackupsAvailable
				? 'Upgrade your plan to ensure your data stays safe and backed up'
				: 'Protect your data by quickly adding a backup policy';

			const ctaText = !areBackupsAvailable ? 'Upgrade plan' : 'Create policy';

			const ctaURL = !areBackupsAvailable
				? getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization).$id)
				: `${page.url.pathname}/backups`;

			HeaderAlert($$renderer, {
				type: 'warning',
				title: 'Your database has no backup policy',
				children: ($$renderer) => {
					{
						$$renderer.push(`${$.escape(subtitle)}`);
					}
				},

				$$slots: {
					default: true,
					buttons: ($$renderer) => {
						{
							$$renderer.push(`<div class="u-flex u-gap-16">`);

							Button($$renderer, {
								href: ctaURL,
								secondary: true,
								fullWidthMobile: true,
								event: !areBackupsAvailable ? 'backup_banner_upgrade' : 'backup_banner_add',
								children: ($$renderer) => {
									$$renderer.push(`<span class="text">${$.escape(ctaText)}</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								text: true,
								event: 'backup_banner_close',
								$$slots: {
									start: ($$renderer) => {
										Icon($$renderer, { icon: IconX, slot: 'start', size: 's' });
									}
								}
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}