import * as $ from 'svelte/internal/server';

import {
	validateLeaseTimeConfig,
	calculateLeaseTime,
	LEASE_TIME_EXAMPLES,
	NETWORK_TYPE_DEFAULTS,
	CHURN_RATE_HOURS,
	formatTime
} from '$lib/utils/dhcp-lease-calculator';

import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

export default function LeaseTimeCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let poolSize = 100;
		let expectedClients = 50;
		let churnRate = 'medium';
		let customChurnHours = undefined;
		let networkType = 'corporate';
		let validationErrors = [];
		let result = null;
		let selectedExampleIndex = null;
		const clipboard = useClipboard();
		const examples = LEASE_TIME_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

		function loadExample(example, index) {
			const cfg = example.config;

			poolSize = cfg.poolSize;
			expectedClients = cfg.expectedClients;
			churnRate = cfg.churnRate;
			customChurnHours = cfg.customChurnHours;
			networkType = cfg.networkType || 'corporate';
			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = examples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const cfg = example.config;
			const matches = poolSize === cfg.poolSize && expectedClients === cfg.expectedClients && churnRate === cfg.churnRate && customChurnHours === cfg.customChurnHours && networkType === (cfg.networkType || 'corporate');

			if (!matches) selectedExampleIndex = null;
		}

		ToolContentContainer($$renderer, {
			title: 'DHCP Lease Time Calculator',
			description: 'Calculate optimal DHCP lease times based on network size, client turnover, and utilization. Includes T1/T2 renewal times and configuration examples.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-6ki5fj"><div class="card-header svelte-6ki5fj"><h3 class="svelte-6ki5fj">Network Configuration</h3> <p class="help-text svelte-6ki5fj">Enter your network characteristics to calculate optimal lease times</p></div> <div class="card-content svelte-6ki5fj"><div class="input-row svelte-6ki5fj"><div class="input-group svelte-6ki5fj"><label for="pool-size" class="svelte-6ki5fj">`);
				Icon($$renderer, { name: 'layers', size: 'sm' });
				$$renderer.push(`<!----> IP Pool Size</label> <input id="pool-size" type="number"${$.attr('value', poolSize)} placeholder="100" min="1" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Total available IP addresses in your DHCP pool</small></div> <div class="input-group svelte-6ki5fj"><label for="expected-clients" class="svelte-6ki5fj">`);
				Icon($$renderer, { name: 'users', size: 'sm' });
				$$renderer.push(`<!----> Expected Clients</label> <input id="expected-clients" type="number"${$.attr('value', expectedClients)} placeholder="50" min="0" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Average number of concurrent clients</small></div></div> <div class="input-group svelte-6ki5fj"><label for="network-type" class="svelte-6ki5fj">`);
				Icon($$renderer, { name: 'network', size: 'sm' });
				$$renderer.push(`<!----> Network Type</label> `);

				$$renderer.select(
					{ id: 'network-type', value: networkType, class: '' },
					($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(Object.entries(NETWORK_TYPE_DEFAULTS));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let [key, value] = each_array[$$index];

							$$renderer.option({ value: key }, ($$renderer) => {
								$$renderer.push(`${$.escape(value.name)}`);
							});
						}

						$$renderer.push(`<!--]-->`);

						$$renderer.option({ value: 'custom' }, ($$renderer) => {
							$$renderer.push(`Custom (use churn rate)`);
						});
					},
					'svelte-6ki5fj'
				);

				$$renderer.push(` `);

				if (networkType !== 'custom') {
					$$renderer.push(`<!--[0--><small class="svelte-6ki5fj">${$.escape(NETWORK_TYPE_DEFAULTS[networkType].description)}</small>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="input-group svelte-6ki5fj"><label for="churn-rate" class="svelte-6ki5fj">`);
				Icon($$renderer, { name: 'refresh', size: 'sm' });
				$$renderer.push(`<!----> Client Churn Rate</label> `);

				$$renderer.select(
					{ id: 'churn-rate', value: churnRate, class: '' },
					($$renderer) => {
						$$renderer.option({ value: 'low' }, ($$renderer) => {
							$$renderer.push(`Low - ${$.escape(formatTime(CHURN_RATE_HOURS.low * 3600))}`);
						});

						$$renderer.option({ value: 'medium' }, ($$renderer) => {
							$$renderer.push(`Medium - ${$.escape(formatTime(CHURN_RATE_HOURS.medium * 3600))}`);
						});

						$$renderer.option({ value: 'high' }, ($$renderer) => {
							$$renderer.push(`High - ${$.escape(formatTime(CHURN_RATE_HOURS.high * 3600))}`);
						});

						$$renderer.option({ value: 'custom' }, ($$renderer) => {
							$$renderer.push(`Custom`);
						});
					},
					'svelte-6ki5fj'
				);

				$$renderer.push(` <small class="svelte-6ki5fj">How long devices typically stay connected</small></div> `);

				if (churnRate === 'custom') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-6ki5fj"><label for="custom-churn" class="svelte-6ki5fj">`);
					Icon($$renderer, { name: 'clock', size: 'sm' });
					$$renderer.push(`<!----> Custom Churn Time (hours)</label> <input id="custom-churn" type="number"${$.attr('value', customChurnHours)} placeholder="24" min="1" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Average hours a device stays connected</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-6ki5fj"><h3 class="svelte-6ki5fj">Validation Errors</h3> <!--[-->`);

					const each_array_1 = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let error = each_array_1[i];

						$$renderer.push(`<div class="error-message svelte-6ki5fj">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push(`<!--[0--><div class="card results svelte-6ki5fj"><h3 class="svelte-6ki5fj">Calculated Lease Times</h3> <div class="summary-card svelte-6ki5fj"><div class="svelte-6ki5fj"><strong class="svelte-6ki5fj">Pool Utilization:</strong> ${$.escape(result.utilizationPercent)}%</div> <div class="svelte-6ki5fj"><strong class="svelte-6ki5fj">Recommended Lease:</strong> ${$.escape(result.recommendedLeaseFormatted)}</div></div> `);

					if (result.exhaustionTime) {
						$$renderer.push(`<!--[0--><div class="warning-card svelte-6ki5fj">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <span><strong>Address Exhaustion:</strong> ${$.escape(result.exhaustionTime)}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="lease-times svelte-6ki5fj"><!--[-->`);

					const each_array_2 = $.ensure_array_like([
						{
							label: 'Default Lease Time',
							value: result.recommendedLeaseFormatted,
							seconds: result.recommendedLeaseSeconds,
							key: 'lease'
						},

						{
							label: 'T1 (Renewal)',
							value: result.t1RenewalFormatted,
							seconds: result.t1RenewalSeconds,
							key: 't1'
						},

						{
							label: 'T2 (Rebinding)',
							value: result.t2RebindingFormatted,
							seconds: result.t2RebindingSeconds,
							key: 't2'
						}
					]);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let time = each_array_2[$$index_2];

						$$renderer.push(`<div class="time-item svelte-6ki5fj"><div class="time-header svelte-6ki5fj"><span class="time-label svelte-6ki5fj">${$.escape(time.label)}</span> <button type="button" class="copy-btn-small svelte-6ki5fj">`);

						Icon($$renderer, {
							name: clipboard.isCopied(time.key) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div> <div class="time-value svelte-6ki5fj">${$.escape(time.value)}</div> <div class="time-seconds svelte-6ki5fj">${$.escape(time.seconds)} seconds</div></div>`);
					}

					$$renderer.push(`<!--]--></div> `);

					if (result.recommendations.length > 0) {
						$$renderer.push(`<!--[0--><div class="recommendations svelte-6ki5fj"><h4 class="svelte-6ki5fj">Recommendations</h4> <!--[-->`);

						const each_array_3 = $.ensure_array_like(result.recommendations);

						for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
							let recommendation = each_array_3[i];

							$$renderer.push(`<div class="recommendation-item svelte-6ki5fj">${$.escape(recommendation)}</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <!--[-->`);

					const each_array_4 = $.ensure_array_like([
						{
							title: 'ISC DHCPd Configuration',
							content: result.configExamples.iscDhcpd,
							key: 'isc'
						},

						{
							title: 'Kea DHCPv4 Configuration',
							content: result.configExamples.keaDhcp4,
							key: 'kea'
						}
					]);

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let config = each_array_4[$$index_4];

						$$renderer.push(`<div class="card results svelte-6ki5fj"><div class="card-header-with-action svelte-6ki5fj"><h3 class="svelte-6ki5fj">${$.escape(config.title)}</h3> <button type="button"${$.attr_class('copy-btn svelte-6ki5fj', void 0, { 'copied': clipboard.isCopied(config.key) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(config.key) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied(config.key) ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-6ki5fj">${$.escape(config.content)}</pre></div>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}