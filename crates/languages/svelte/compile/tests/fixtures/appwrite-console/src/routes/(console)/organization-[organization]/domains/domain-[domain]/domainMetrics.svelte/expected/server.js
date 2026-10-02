import * as $ from 'svelte/internal/server';
import { UsageCard } from '$lib/components';
import { toLocaleDate } from '$lib/helpers/date';
import { Layout, Status } from '@appwrite.io/pink-svelte';
import { Link } from '$lib/elements';

export default function DomainMetrics($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { domain, retryVerification } = $$props;
		const isDomainVerified = $.derived(() => domain.nameservers.toLowerCase() === 'appwrite');

		const metrics = $.derived(() => [
			{
				value: isDomainVerified() ? 'Verified' : 'Not verified',
				description: 'Status'
			},
			{ value: domain?.registrar || '-', description: 'Registrar' },
			{
				value: domain?.nameservers || '-',
				description: 'Nameservers'
			},

			{
				value: domain?.expire ? toLocaleDate(domain.expire) : '-',
				description: 'Expiry date'
			},

			{
				value: domain?.registrar?.toLowerCase() === 'appwrite' ? domain?.autoRenewal ? 'On' : 'Off' : '-',
				description: 'Auto renewal'
			},

			{
				value: domain?.renewalPrice || '-',
				description: 'Renewal price'
			}
		]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Grid) {
				$$renderer.push('<!--[-->');

				Layout.Grid($$renderer, {
					gap: 'm',
					columnsL: 6,
					columns: 3,
					columnsS: 2,
					columnsXXS: 1,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(metrics().slice(0, 3));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let metric = each_array[$$index];

							if (metric.description === 'Status') {
								$$renderer.push('<!--[0-->');

								UsageCard($$renderer, {
									description: metric.description,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												gap: 'xs',
												alignItems: 'center',
												children: ($$renderer) => {
													$.css_props($$renderer, true, { '--font-size-s': 'var(--font-size-xs)' }, () => {
														Status($$renderer, {
															label: metric.value.toString(),
															status: isDomainVerified() ? 'complete' : 'pending'
														});
													});

													$$renderer.push(` `);

													if (!isDomainVerified()) {
														$$renderer.push('<!--[0-->');

														Link($$renderer, {
															size: 's',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Retry`);
															},
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');
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
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');

								UsageCard($$renderer, {
									description: metric.description,
									get value() {
										return metric.value;
									},

									set value($$value) {
										metric.value = $$value;
										$$settled = false;
									}
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(metrics().slice(3));

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let metric = each_array_1[$$index_1];

							UsageCard($$renderer, {
								description: metric.description,
								get value() {
									return metric.value;
								},

								set value($$value) {
									metric.value = $$value;
									$$settled = false;
								}
							});
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}