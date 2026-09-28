import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { diffDays, toLocaleDate } from '$lib/helpers/date';
import { HeaderAlert } from '$lib/layout';
import { failedInvoice, hideBillingHeaderRoutes } from '$lib/stores/billing';

var root = $.from_html(
	`Your scheduled payment on <b> </b> failed. To resume
                write access of your organization, please update your billing details.`,
	1
);

var root_1 = $.from_html(
	`Your scheduled payment on <b> </b> failed. Access
                to paid projects within this organization will be disabled if no action is taken within
                30 days.`,
	1
);

var root_2 = $.from_html(`<span class="text">Update billing details</span>`);

export default function ProjectsAtRisk($$anchor, $$props) {
	$.push($$props, true);

	const $failedInvoice = () => $.store_get(failedInvoice, '$failedInvoice', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			const daysPassed = $.derived(() => diffDays(new Date($failedInvoice().dueAt), new Date()));

			HeaderAlert($$anchor, {
				title: 'Your projects are at risk',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var b = $.sibling($.first_child(fragment_3));
							var text = $.only_child(b, true);

							$.next();
							$.template_effect(($0) => $.set_text(text, $0), [() => toLocaleDate($failedInvoice()?.dueAt)]);
							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var fragment_4 = root_1();
							var b_1 = $.sibling($.first_child(fragment_4));
							var text_1 = $.only_child(b_1, true);

							$.next();
							$.template_effect(($0) => $.set_text(text_1, $0), [() => toLocaleDate($failedInvoice()?.dueAt)]);
							$.append($$anchor, fragment_4);
						};

						$.if(node_1, ($$render) => {
							if ($.get(daysPassed) > 30) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					buttons: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => `${base}/organization-${$failedInvoice()?.teamId}/billing#paymentMethods`);

							Button($$anchor, {
								get href() {
									return $.get($0);
								},
								secondary: true,
								fullWidthMobile: true,
								children: ($$anchor, $$slotProps) => {
									var span = root_2();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		};

		var d = $.derived(() => $failedInvoice() && !hideBillingHeaderRoutes.includes(page.url.pathname));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}