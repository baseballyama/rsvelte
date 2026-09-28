import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PageHeader from '$lib/components/layout/page-header.svelte';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="space-y-1"><!> <p class="text-xs opacity-60"> </p></div> <!> <!>`, 1);
var root_1 = $.from_html(`<hr class="hr"/>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<tr><td><span class="badge preset-tonal"> </span></td><td> </td><td class="whitespace-nowrap"> </td></tr>`);
var root_4 = $.from_html(`<div><!> <div class="container-page space-y-4"><section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">Preferences</h2> <p class="opacity-60">Choose which emails and in-app alerts you want to receive.</p></header> <hr class="hr"/> <div class="grid gap-2"></div></section> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><header class="space-y-2"><h2 class="h3">Recent</h2> <p class="opacity-60">Shows a log of recent activity.</p></header> <div class="table-wrap"><table class="table caption-bottom"><thead><tr><th>Type</th><th>Message</th><th>Date</th></tr></thead><tbody></tbody></table></div></section></div></div>`);

export default function _page($$anchor) {
	const settings = $.proxy([
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
	]);

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

	var div = root_4();
	var node = $.child(div);

	PageHeader(node, { title: 'Notifications' });

	var div_1 = $.sibling(node, 2);
	var section = $.child(div_1);
	var div_2 = $.sibling($.child(section), 4);

	$.each(div_2, 23, () => settings, (setting) => setting.id, ($$anchor, setting, i) => {
		var fragment = root_2();
		var node_1 = $.first_child(fragment);

		Switch(node_1, {
			class: 'flex justify-between gap-4 p-2',
			get checked() {
				return $.get(setting).checked;
			},
			onCheckedChange: (details) => ($.get(setting).checked = details.checked),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div_3 = $.first_child(fragment_1);
				var node_2 = $.child(div_3);

				$.component(node_2, () => Switch.Label, ($$anchor, Switch_Label) => {
					Switch_Label($$anchor, {
						class: 'font-bold',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(setting).label));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var p = $.sibling(node_2, 2);
				var text_1 = $.only_child(p, true);

				$.reset(div_3);

				var node_3 = $.sibling(div_3, 2);

				$.component(node_3, () => Switch.Control, ($$anchor, Switch_Control) => {
					Switch_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
								Switch_Thumb($$anchor, {});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
					Switch_HiddenInput($$anchor, {});
				});

				$.template_effect(() => $.set_text(text_1, $.get(setting).description));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		var node_6 = $.sibling(node_1, 2);

		{
			var consequent = ($$anchor) => {
				var hr = root_1();

				$.append($$anchor, hr);
			};

			$.if(node_6, ($$render) => {
				if ($.get(i) < settings.length - 1) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_2);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.sibling($.child(section_1), 2);
	var table = $.child(div_4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => recent, ({ type, message, date }) => date + message, ($$anchor, $$item) => {
		let type = () => $.get($$item).type;
		let message = () => $.get($$item).message;
		let date = () => $.get($$item).date;
		var tr = root_3();
		var td = $.child(tr);
		var span = $.child(td);
		var text_2 = $.only_child(span, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_3 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_4 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_2, type());
			$.set_text(text_3, message());
			$.set_text(text_4, date());
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_4);
	$.reset(section_1);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}