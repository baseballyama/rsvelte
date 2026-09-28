import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UsageCard } from '$lib/components';
import { toLocaleDate } from '$lib/helpers/date';
import { Layout, Status } from '@appwrite.io/pink-svelte';
import { Link } from '$lib/elements';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DomainMetrics($$anchor, $$props) {
	$.push($$props, true);

	const isDomainVerified = $.derived(() => $$props.domain.nameservers.toLowerCase() === 'appwrite');

	const metrics = $.derived(() => [
		{
			value: $.get(isDomainVerified) ? 'Verified' : 'Not verified',
			description: 'Status'
		},

		{
			value: $$props.domain?.registrar || '-',
			description: 'Registrar'
		},

		{
			value: $$props.domain?.nameservers || '-',
			description: 'Nameservers'
		},

		{
			value: $$props.domain?.expire ? toLocaleDate($$props.domain.expire) : '-',
			description: 'Expiry date'
		},

		{
			value: $$props.domain?.registrar?.toLowerCase() === 'appwrite' ? $$props.domain?.autoRenewal ? 'On' : 'Off' : '-',
			description: 'Auto renewal'
		},

		{
			value: $$props.domain?.renewalPrice || '-',
			description: 'Renewal price'
		}
	]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Grid, ($$anchor, Layout_Grid) => {
		Layout_Grid($$anchor, {
			gap: 'm',
			columnsL: 6,
			columns: 3,
			columnsS: 2,
			columnsXXS: 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $.get(metrics).slice(0, 3), $.index, ($$anchor, metric, $$index) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							UsageCard($$anchor, {
								get description() {
									return $.get(metric).description;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											direction: 'row',
											gap: 'xs',
											alignItems: 'center',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => $.get(metric).value.toString());
													let $1 = $.derived(() => $.get(isDomainVerified) ? 'complete' : 'pending');

													$.css_props(node_4, () => ({ '--font-size-s': 'var(--font-size-xs)' }));

													Status(node_4.lastChild, {
														get label() {
															return $.get($0);
														},

														get status() {
															return $.get($1);
														}
													});

													$.reset(node_4);
												}

												var node_5 = $.sibling(node_4, 2);

												{
													var consequent = ($$anchor) => {
														Link($$anchor, {
															size: 's',
															$$events: {
																click: function (...$$args) {
																	$$props.retryVerification?.apply(this, $$args);
																}
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Retry');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_5, ($$render) => {
														if (!$.get(isDomainVerified)) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						};

						var alternate = ($$anchor) => {
							UsageCard($$anchor, {
								get description() {
									return $.get(metric).description;
								},

								get value() {
									return $.get(metric).value;
								},

								set value($$value) {
									($.get(metric).value = $$value);
								}
							});
						};

						$.if(node_2, ($$render) => {
							if ($.get(metric).description === 'Status') $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				var node_6 = $.sibling(node_1, 2);

				$.each(node_6, 17, () => $.get(metrics).slice(3), $.index, ($$anchor, metric, $$index_1) => {
					UsageCard($$anchor, {
						get description() {
							return $.get(metric).description;
						},

						get value() {
							return $.get(metric).value;
						},

						set value($$value) {
							($.get(metric).value = $$value);
						}
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}