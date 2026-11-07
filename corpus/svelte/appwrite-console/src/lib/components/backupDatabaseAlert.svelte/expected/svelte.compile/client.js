import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="text"> </span>`);
var root_1 = $.from_html(`<div class="u-flex u-gap-16"><!> <!></div>`);

export default function BackupDatabaseAlert($$anchor, $$props) {
	$.push($$props, true);

	const $showPolicyAlert = () => $.store_get(showPolicyAlert, '$showPolicyAlert', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function handleClose() {
		showPolicyAlert.set(false);
		hideNotification(backupsBannerId);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const areBackupsAvailable = $.derived(() => $currentPlan()?.backupsEnabled);

			const subtitle = $.derived(() => !$.get(areBackupsAvailable)
				? 'Upgrade your plan to ensure your data stays safe and backed up'
				: 'Protect your data by quickly adding a backup policy');

			const ctaText = $.derived(() => !$.get(areBackupsAvailable) ? 'Upgrade plan' : 'Create policy');

			const ctaURL = $.derived(() => !$.get(areBackupsAvailable)
				? getChangePlanUrl($organization().$id)
				: `${page.url.pathname}/backups`);

			HeaderAlert($$anchor, {
				type: 'warning',
				title: 'Your database has no backup policy',
				children: ($$anchor, $$slotProps) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(subtitle)));
					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					buttons: ($$anchor, $$slotProps) => {
						var div = root_1();
						var node_1 = $.child(div);

						{
							let $0 = $.derived(() => !$.get(areBackupsAvailable) ? 'backup_banner_upgrade' : 'backup_banner_add');

							Button(node_1, {
								get href() {
									return $.get(ctaURL);
								},
								secondary: true,
								fullWidthMobile: true,
								get event() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var span = root();
									var text_1 = $.only_child(span, true);

									$.template_effect(() => $.set_text(text_1, $.get(ctaText)));
									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						}

						var node_2 = $.sibling(node_1, 2);

						Button(node_2, {
							text: true,
							event: 'backup_banner_close',
							$$events: { click: handleClose },
							$$slots: {
								start: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get icon() {
											return IconX;
										},
										slot: 'start',
										size: 's'
									});
								}
							}
						});

						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});
		};

		var d = $.derived(() => $showPolicyAlert() && isCloud && $organization()?.$id && page.url.pathname.match(/\/databases\/database-[^/]+$/));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}