import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<small class="svelte-6ki5fj"> </small>`);
var root_2 = $.from_html(`<div class="input-group svelte-6ki5fj"><label for="custom-churn" class="svelte-6ki5fj"><!> Custom Churn Time (hours)</label> <input id="custom-churn" type="number" placeholder="24" min="1" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Average hours a device stays connected</small></div>`);
var root_3 = $.from_html(`<div class="error-message svelte-6ki5fj"><!> </div>`);
var root_4 = $.from_html(`<div class="card errors-card svelte-6ki5fj"><h3 class="svelte-6ki5fj">Validation Errors</h3> <!></div>`);
var root_5 = $.from_html(`<div class="warning-card svelte-6ki5fj"><!> <span><strong>Address Exhaustion:</strong> </span></div>`);
var root_6 = $.from_html(`<div class="time-item svelte-6ki5fj"><div class="time-header svelte-6ki5fj"><span class="time-label svelte-6ki5fj"> </span> <button type="button" class="copy-btn-small svelte-6ki5fj"><!></button></div> <div class="time-value svelte-6ki5fj"> </div> <div class="time-seconds svelte-6ki5fj"> </div></div>`);
var root_7 = $.from_html(`<div class="recommendation-item svelte-6ki5fj"> </div>`);
var root_8 = $.from_html(`<div class="recommendations svelte-6ki5fj"><h4 class="svelte-6ki5fj">Recommendations</h4> <!></div>`);
var root_9 = $.from_html(`<div class="card results svelte-6ki5fj"><div class="card-header-with-action svelte-6ki5fj"><h3 class="svelte-6ki5fj"> </h3> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-6ki5fj"> </pre></div>`);
var root_10 = $.from_html(`<div class="card results svelte-6ki5fj"><h3 class="svelte-6ki5fj">Calculated Lease Times</h3> <div class="summary-card svelte-6ki5fj"><div class="svelte-6ki5fj"><strong class="svelte-6ki5fj">Pool Utilization:</strong> </div> <div class="svelte-6ki5fj"><strong class="svelte-6ki5fj">Recommended Lease:</strong> </div></div> <!> <div class="lease-times svelte-6ki5fj"></div> <!></div> <!>`, 1);
var root_11 = $.from_html(`<!> <div class="card input-card svelte-6ki5fj"><div class="card-header svelte-6ki5fj"><h3 class="svelte-6ki5fj">Network Configuration</h3> <p class="help-text svelte-6ki5fj">Enter your network characteristics to calculate optimal lease times</p></div> <div class="card-content svelte-6ki5fj"><div class="input-row svelte-6ki5fj"><div class="input-group svelte-6ki5fj"><label for="pool-size" class="svelte-6ki5fj"><!> IP Pool Size</label> <input id="pool-size" type="number" placeholder="100" min="1" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Total available IP addresses in your DHCP pool</small></div> <div class="input-group svelte-6ki5fj"><label for="expected-clients" class="svelte-6ki5fj"><!> Expected Clients</label> <input id="expected-clients" type="number" placeholder="50" min="0" class="svelte-6ki5fj"/> <small class="svelte-6ki5fj">Average number of concurrent clients</small></div></div> <div class="input-group svelte-6ki5fj"><label for="network-type" class="svelte-6ki5fj"><!> Network Type</label> <select id="network-type" class="svelte-6ki5fj"><!><option>Custom (use churn rate)</option></select> <!></div> <div class="input-group svelte-6ki5fj"><label for="churn-rate" class="svelte-6ki5fj"><!> Client Churn Rate</label> <select id="churn-rate" class="svelte-6ki5fj"><option> </option><option> </option><option> </option><option>Custom</option></select> <small class="svelte-6ki5fj">How long devices typically stay connected</small></div> <!></div></div> <!> <!>`, 1);

export default function LeaseTimeCalculator($$anchor, $$props) {
	$.push($$props, true);

	let poolSize = $.state(100);
	let expectedClients = $.state(50);
	let churnRate = $.state('medium');
	let customChurnHours = $.state(undefined);
	let networkType = $.state('corporate');
	let validationErrors = $.state($.proxy([]));
	let result = $.state(null);
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();
	const examples = LEASE_TIME_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

	function loadExample(example, index) {
		const cfg = example.config;

		$.set(poolSize, cfg.poolSize, true);
		$.set(expectedClients, cfg.expectedClients, true);
		$.set(churnRate, cfg.churnRate, true);
		$.set(customChurnHours, cfg.customChurnHours, true);
		$.set(networkType, cfg.networkType || 'corporate', true);
		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = examples[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const cfg = example.config;
		const matches = $.get(poolSize) === cfg.poolSize && $.get(expectedClients) === cfg.expectedClients && $.get(churnRate) === cfg.churnRate && $.get(customChurnHours) === cfg.customChurnHours && $.get(networkType) === (cfg.networkType || 'corporate');

		if (!matches) $.set(selectedExampleIndex, null);
	}

	$.user_effect(() => {
		const currentPoolSize = $.get(poolSize);
		const currentExpectedClients = $.get(expectedClients);
		const currentChurnRate = $.get(churnRate);
		const currentCustomChurnHours = $.get(customChurnHours);
		const currentNetworkType = $.get(networkType);

		untrack(() => {
			const config = {
				poolSize: currentPoolSize ?? 0,
				expectedClients: currentExpectedClients ?? 0,
				churnRate: currentChurnRate,
				customChurnHours: currentCustomChurnHours,
				networkType: currentNetworkType === 'custom' ? undefined : currentNetworkType
			};

			const isInitialState = currentPoolSize === undefined || currentExpectedClients === undefined;

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateLeaseTimeConfig(config), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, calculateLeaseTime(config), true);
					} catch(e) {
						$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
						$.set(result, null);
					}
				} else {
					$.set(result, null);
				}
			}

			checkIfExampleStillMatches();
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCP Lease Time Calculator',
		description: 'Calculate optimal DHCP lease times based on network size, client turnover, and utilization. Includes T1/T2 renewal times and configuration examples.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_11();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return examples;
				},
				onSelect: loadExample,
				getLabel: (ex) => ex.label,
				getDescription: (ex) => ex.description,
				get selectedIndex() {
					return $.get(selectedExampleIndex);
				}
			});

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var label = $.child(div_3);
			var node_1 = $.child(label);

			Icon(node_1, { name: 'layers', size: 'sm' });
			$.next();
			$.reset(label);

			var input = $.sibling(label, 2);

			$.remove_input_defaults(input);
			$.next(2);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var label_1 = $.child(div_4);
			var node_2 = $.child(label_1);

			Icon(node_2, { name: 'users', size: 'sm' });
			$.next();
			$.reset(label_1);

			var input_1 = $.sibling(label_1, 2);

			$.remove_input_defaults(input_1);
			$.next(2);
			$.reset(div_4);
			$.reset(div_2);

			var div_5 = $.sibling(div_2, 2);
			var label_2 = $.child(div_5);
			var node_3 = $.child(label_2);

			Icon(node_3, { name: 'network', size: 'sm' });
			$.next();
			$.reset(label_2);

			var select = $.sibling(label_2, 2);
			var node_4 = $.child(select);

			$.each(node_4, 17, () => Object.entries(NETWORK_TYPE_DEFAULTS), ([key, value]) => key, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let value = () => $.get($$array)[1];
				var option = root();
				var text = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_text(text, value().name);

					if (option_value !== (option_value = key())) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			var option_1 = $.sibling(node_4);

			option_1.value = option_1.__value = 'custom';
			$.reset(select);
			$.init_select(select);

			var node_5 = $.sibling(select, 2);

			{
				var consequent = ($$anchor) => {
					var small = root_1();
					var text_1 = $.only_child(small, true);

					$.template_effect(() => $.set_text(text_1, NETWORK_TYPE_DEFAULTS[$.get(networkType)].description));
					$.append($$anchor, small);
				};

				$.if(node_5, ($$render) => {
					if ($.get(networkType) !== 'custom') $$render(consequent);
				});
			}

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var label_3 = $.child(div_6);
			var node_6 = $.child(label_3);

			Icon(node_6, { name: 'refresh', size: 'sm' });
			$.next();
			$.reset(label_3);

			var select_1 = $.sibling(label_3, 2);
			var option_2 = $.child(select_1);
			var text_2 = $.only_child(option_2);

			option_2.value = option_2.__value = 'low';

			var option_3 = $.sibling(option_2);
			var text_3 = $.only_child(option_3);

			option_3.value = option_3.__value = 'medium';

			var option_4 = $.sibling(option_3);
			var text_4 = $.only_child(option_4);

			option_4.value = option_4.__value = 'high';

			var option_5 = $.sibling(option_4);

			option_5.value = option_5.__value = 'custom';
			$.reset(select_1);
			$.init_select(select_1);
			$.next(2);
			$.reset(div_6);

			var node_7 = $.sibling(div_6, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_2();
					var label_4 = $.child(div_7);
					var node_8 = $.child(label_4);

					Icon(node_8, { name: 'clock', size: 'sm' });
					$.next();
					$.reset(label_4);

					var input_2 = $.sibling(label_4, 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_7);
					$.bind_value(input_2, () => $.get(customChurnHours), ($$value) => $.set(customChurnHours, $$value));
					$.append($$anchor, div_7);
				};

				$.if(node_7, ($$render) => {
					if ($.get(churnRate) === 'custom') $$render(consequent_1);
				});
			}

			$.reset(div_1);
			$.reset(div);

			var node_9 = $.sibling(div, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_8 = root_4();
					var node_10 = $.sibling($.child(div_8), 2);

					$.each(node_10, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_9 = root_3();
						var node_11 = $.child(div_9);

						Icon(node_11, { name: 'alert-triangle', size: 'sm' });

						var text_5 = $.sibling(node_11);

						$.reset(div_9);
						$.template_effect(() => $.set_text(text_5, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_9);
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_9, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent_2);
				});
			}

			var node_12 = $.sibling(node_9, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_10();
					var div_10 = $.first_child(fragment_2);
					var div_11 = $.sibling($.child(div_10), 2);
					var div_12 = $.child(div_11);
					var text_6 = $.sibling($.child(div_12));

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var text_7 = $.sibling($.child(div_13));

					$.reset(div_13);
					$.reset(div_11);

					var node_13 = $.sibling(div_11, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_14 = root_5();
							var node_14 = $.child(div_14);

							Icon(node_14, { name: 'alert-triangle', size: 'sm' });

							var span = $.sibling(node_14, 2);
							var text_8 = $.sibling($.child(span));

							$.reset(span);
							$.reset(div_14);
							$.template_effect(() => $.set_text(text_8, ` ${$.get(result).exhaustionTime ?? ''}`));
							$.append($$anchor, div_14);
						};

						$.if(node_13, ($$render) => {
							if ($.get(result).exhaustionTime) $$render(consequent_3);
						});
					}

					var div_15 = $.sibling(node_13, 2);

					$.each(
						div_15,
						21,
						() => [
							{
								label: 'Default Lease Time',
								value: $.get(result).recommendedLeaseFormatted,
								seconds: $.get(result).recommendedLeaseSeconds,
								key: 'lease'
							},

							{
								label: 'T1 (Renewal)',
								value: $.get(result).t1RenewalFormatted,
								seconds: $.get(result).t1RenewalSeconds,
								key: 't1'
							},

							{
								label: 'T2 (Rebinding)',
								value: $.get(result).t2RebindingFormatted,
								seconds: $.get(result).t2RebindingSeconds,
								key: 't2'
							}
						],
						(time) => time.key,
						($$anchor, time) => {
							var div_16 = root_6();
							var div_17 = $.child(div_16);
							var span_1 = $.child(div_17);
							var text_9 = $.only_child(span_1, true);
							var button = $.sibling(span_1, 2);
							var node_15 = $.child(button);

							{
								let $0 = $.derived(() => clipboard.isCopied($.get(time).key) ? 'check' : 'copy');

								Icon(node_15, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							$.reset(button);
							$.reset(div_17);

							var div_18 = $.sibling(div_17, 2);
							var text_10 = $.only_child(div_18, true);
							var div_19 = $.sibling(div_18, 2);
							var text_11 = $.only_child(div_19);

							$.reset(div_16);

							$.template_effect(() => {
								$.set_text(text_9, $.get(time).label);
								$.set_text(text_10, $.get(time).value);
								$.set_text(text_11, `${$.get(time).seconds ?? ''} seconds`);
							});

							$.delegated('click', button, () => clipboard.copy(String($.get(time).seconds), $.get(time).key));
							$.append($$anchor, div_16);
						}
					);

					$.reset(div_15);

					var node_16 = $.sibling(div_15, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_20 = root_8();
							var node_17 = $.sibling($.child(div_20), 2);

							$.each(node_17, 17, () => $.get(result).recommendations, $.index, ($$anchor, recommendation) => {
								var div_21 = root_7();
								var text_12 = $.only_child(div_21, true);

								$.template_effect(() => $.set_text(text_12, $.get(recommendation)));
								$.append($$anchor, div_21);
							});

							$.reset(div_20);
							$.append($$anchor, div_20);
						};

						$.if(node_16, ($$render) => {
							if ($.get(result).recommendations.length > 0) $$render(consequent_4);
						});
					}

					$.reset(div_10);

					var node_18 = $.sibling(div_10, 2);

					$.each(
						node_18,
						17,
						() => [
							{
								title: 'ISC DHCPd Configuration',
								content: $.get(result).configExamples.iscDhcpd,
								key: 'isc'
							},

							{
								title: 'Kea DHCPv4 Configuration',
								content: $.get(result).configExamples.keaDhcp4,
								key: 'kea'
							}
						],
						(config) => config.key,
						($$anchor, config) => {
							var div_22 = root_9();
							var div_23 = $.child(div_22);
							var h3 = $.child(div_23);
							var text_13 = $.only_child(h3, true);
							var button_1 = $.sibling(h3, 2);
							let classes;
							var node_19 = $.child(button_1);

							{
								let $0 = $.derived(() => clipboard.isCopied($.get(config).key) ? 'check' : 'copy');

								Icon(node_19, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_14 = $.sibling(node_19);

							$.reset(button_1);
							$.reset(div_23);

							var pre = $.sibling(div_23, 2);
							var text_15 = $.only_child(pre, true);

							$.reset(div_22);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_13, $.get(config).title);
									classes = $.set_class(button_1, 1, 'copy-btn svelte-6ki5fj', null, classes, { copied: $0 });
									$.set_text(text_14, ` ${$1 ?? ''}`);
									$.set_text(text_15, $.get(config).content);
								},
								[
									() => clipboard.isCopied($.get(config).key),
									() => clipboard.isCopied($.get(config).key) ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_1, () => clipboard.copy($.get(config).content, $.get(config).key));
							$.append($$anchor, div_22);
						}
					);

					$.template_effect(() => {
						$.set_text(text_6, ` ${$.get(result).utilizationPercent ?? ''}%`);
						$.set_text(text_7, ` ${$.get(result).recommendedLeaseFormatted ?? ''}`);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_12, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_5);
				});
			}

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_2, `Low - ${$0 ?? ''}`);
					$.set_text(text_3, `Medium - ${$1 ?? ''}`);
					$.set_text(text_4, `High - ${$2 ?? ''}`);
				},
				[
					() => formatTime(CHURN_RATE_HOURS.low * 3600),
					() => formatTime(CHURN_RATE_HOURS.medium * 3600),
					() => formatTime(CHURN_RATE_HOURS.high * 3600)
				]
			);

			$.bind_value(input, () => $.get(poolSize), ($$value) => $.set(poolSize, $$value));
			$.bind_value(input_1, () => $.get(expectedClients), ($$value) => $.set(expectedClients, $$value));
			$.bind_select_value(select, () => $.get(networkType), ($$value) => $.set(networkType, $$value));
			$.bind_select_value(select_1, () => $.get(churnRate), ($$value) => $.set(churnRate, $$value));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);