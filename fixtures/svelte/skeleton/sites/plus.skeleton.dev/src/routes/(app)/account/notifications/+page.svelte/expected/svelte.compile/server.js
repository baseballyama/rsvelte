import * as $ from 'svelte/internal/server';
import PageHeader from '$lib/components/layout/page-header.svelte';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	const settings = [
		{
			id: 'product-updates',
			label: 'Product updates',
			description: 'New releases, features, and changelog highlights.',
			checked: true
		},

		{
			id: 'security-alerts',
			label: 'Security alerts',
			description: 'Sign-in activity and account security notices.',
			checked: true
		},

		{
			id: 'billing-receipts',
			label: 'Billing & receipts',
			description: 'Invoices, renewals, and payment confirmations.',
			checked: true
		},

		{
			id: 'community-digest',
			label: 'Community digest',
			description: 'Weekly summary of Discord, GitHub, and showcase activity.',
			checked: false
		},

		{
			id: 'marketing',
			label: 'Marketing & promotions',
			description: 'Occasional offers, surveys, and partner announcements.',
			checked: false
		}
	];

	const recent = [
		{
			type: 'Billing',
			message: 'Receipt for your Plus subscription is ready.',
			date: 'May 12, 2026 · 9:42 AM'
		},

		{
			type: 'Security',
			message: 'New sign-in from Chrome on macOS.',
			date: 'May 10, 2026 · 6:18 PM'
		},

		{
			type: 'Product',
			message: 'Skeleton v4.2 is now available.',
			date: 'May 08, 2026 · 11:05 AM'
		},

		{
			type: 'Team',
			message: 'Grace Hopper accepted your invitation.',
			date: 'May 03, 2026 · 2:27 PM'
		},

		{
			type: 'Community',
			message: 'Your weekly community digest is here.',
			date: 'Apr 28, 2026 · 7:00 AM'
		}
	];

	$$renderer.push(`<div>`);
	PageHeader($$renderer, { title: 'Notifications' });
	$$renderer.push(`<!----> <div class="container-page space-y-4"><section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">Preferences</h2> <p class="opacity-60">Choose which emails and in-app alerts you want to receive.</p></header> <hr class="hr"/> <div class="grid gap-2"><!--[-->`);

	const each_array = $.ensure_array_like(settings);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let setting = each_array[i];

		Switch($$renderer, {
			class: 'flex justify-between gap-4 p-2',
			checked: setting.checked,
			onCheckedChange: (details) => setting.checked = details.checked,
			children: ($$renderer) => {
				$$renderer.push(`<div class="space-y-1">`);

				if (Switch.Label) {
					$$renderer.push('<!--[-->');

					Switch.Label($$renderer, {
						class: 'font-bold',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(setting.label)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <p class="text-xs opacity-60">${$.escape(setting.description)}</p></div> `);

				if (Switch.Control) {
					$$renderer.push('<!--[-->');

					Switch.Control($$renderer, {
						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');
								Switch.Thumb($$renderer, {});
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

				$$renderer.push(` `);

				if (Switch.HiddenInput) {
					$$renderer.push('<!--[-->');
					Switch.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (i < settings.length - 1) {
			$$renderer.push(`<!--[0--><hr class="hr"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--></div></section> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">Recent</h2> <p class="opacity-60">Shows a log of recent activity.</p></header> <div class="table-wrap"><table class="table caption-bottom"><thead><tr><th>Type</th><th>Message</th><th>Date</th></tr></thead><tbody><!--[-->`);

	const each_array_1 = $.ensure_array_like(recent);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let { type, message, date } = each_array_1[$$index_1];

		$$renderer.push(`<tr><td><span class="badge preset-tonal">${$.escape(type)}</span></td><td>${$.escape(message)}</td><td class="whitespace-nowrap">${$.escape(date)}</td></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table></div></section></div></div>`);
}