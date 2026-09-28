import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	buildLeaseTimeOption,
	decodeLeaseTimeOption,
	validateLeaseTimeConfig,
	formatTime,
	LEASE_TIME_PRESETS
} from '$lib/utils/dhcp-option51-lease-time';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

var root = $.from_html(`<span class="hint svelte-bhzrvk"> </span>`);
var root_1 = $.from_html(`<div class="form-group svelte-bhzrvk"><label for="lease-seconds" class="svelte-bhzrvk">Lease Time (seconds)</label> <input id="lease-seconds" type="number" min="0" max="4294967294" class="input svelte-bhzrvk"/> <!></div> <div class="quick-values svelte-bhzrvk"><span class="label svelte-bhzrvk">Quick Values:</span> <button class="btn-quick svelte-bhzrvk">1h</button> <button class="btn-quick svelte-bhzrvk">4h</button> <button class="btn-quick svelte-bhzrvk">24h</button> <button class="btn-quick svelte-bhzrvk">3d</button> <button class="btn-quick svelte-bhzrvk">7d</button></div>`, 1);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div><strong class="svelte-bhzrvk"> </strong> <ul class="svelte-bhzrvk"></ul></div>`);
var root_4 = $.from_html(`<div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T1 Renewal:</span> <span class="value svelte-bhzrvk"> </span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T2 Rebinding:</span> <span class="value svelte-bhzrvk"> </span></div>`, 1);
var root_5 = $.from_html(`<div class="card result-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Option 51 - Lease Time</h3> <div class="result-grid svelte-bhzrvk"><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Lease Time:</span> <span class="value highlight svelte-bhzrvk"> </span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Hex Encoded:</span> <code class="code-value svelte-bhzrvk"> </code> <button aria-label="Copy hex"> </button></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Wire Format:</span> <code class="code-value svelte-bhzrvk"> </code> <button aria-label="Copy wire format"> </button></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Total Length:</span> <span class="value svelte-bhzrvk"> </span></div> <!></div> <div class="config-section svelte-bhzrvk"><h4 class="svelte-bhzrvk">Configuration Examples</h4> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">ISC DHCPd</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">Kea DHCPv4</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">dnsmasq</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div></div></div>`);
var root_6 = $.from_html(`<!> <div class="card input-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Lease Time Configuration</h3> <div class="form-group svelte-bhzrvk"><label class="checkbox-label svelte-bhzrvk"><input type="checkbox" class="svelte-bhzrvk"/> Infinite Lease (0xFFFFFFFF)</label> <span class="hint svelte-bhzrvk">Permanent IP address assignment (may not be supported by all servers)</span></div> <!> <!></div> <!>`, 1);
var root_7 = $.from_html(`<div class="error-card svelte-bhzrvk"><strong class="svelte-bhzrvk">Decode Error:</strong> <p class="svelte-bhzrvk"> </p></div>`);
var root_8 = $.from_html(`<div class="result-item infinite-badge svelte-bhzrvk"><span class="badge svelte-bhzrvk">Infinite Lease</span></div>`);
var root_9 = $.from_html(`<div class="card result-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Decoded Option 51</h3> <div class="result-grid svelte-bhzrvk"><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Lease Time:</span> <span class="value highlight svelte-bhzrvk"> </span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Seconds:</span> <span class="value svelte-bhzrvk"> </span></div> <!> <!></div> <div class="config-section svelte-bhzrvk"><h4 class="svelte-bhzrvk">Configuration Examples</h4> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">ISC DHCPd</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">Kea DHCPv4</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">dnsmasq</h5> <button> </button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk"> </code></pre></div></div></div>`);
var root_10 = $.from_html(`<!> <div class="card input-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Decode Option 51</h3> <div class="form-group svelte-bhzrvk"><label for="hex-input" class="svelte-bhzrvk">Hex String</label> <input id="hex-input" type="text" placeholder="e.g., 00015180 or 00 01 51 80" class="input svelte-bhzrvk"/> <span class="hint svelte-bhzrvk">Enter 8 hex characters (4 bytes, spaces optional)</span></div> <!></div> <!>`, 1);

export default function LeaseTimeOption51($$anchor, $$props) {
	$.push($$props, true);

	const clipboard = useClipboard();
	let activeTab = $.state('build');

	// Build mode state
	let leaseSeconds = $.state(86400);

	let infinite = $.state(false);
	let buildResult = $.state(null);
	let buildErrors = $.state($.proxy([]));

	// Decode mode state
	let hexInput = $.state('');

	let decodeResult = $.state(null);
	let decodeError = $.state('');

	const navOptions = [
		{ value: 'build', label: 'Build Option' },
		{ value: 'decode', label: 'Decode Option' }
	];

	const examples = LEASE_TIME_PRESETS.map((preset) => ({
		...preset,
		description: `${preset.description} • ${preset.infinite ? 'Infinite' : formatTime(preset.seconds)}`
	}));

	const decodeExamples = [
		{
			label: '1 Hour',
			hexValue: '00000e10',
			description: '3,600 seconds (0x00000e10)'
		},

		{
			label: '24 Hours',
			hexValue: '00015180',
			description: '86,400 seconds (0x00015180)'
		},

		{
			label: '7 Days',
			hexValue: '00093a80',
			description: '604,800 seconds (0x00093a80)'
		},

		{
			label: 'Infinite',
			hexValue: 'ffffffff',
			description: 'Infinite lease (0xffffffff)'
		}
	];

	function loadPreset(preset) {
		$.set(activeTab, 'build');

		if (preset.infinite) {
			$.set(infinite, true);
			$.set(leaseSeconds, 0);
		} else {
			$.set(infinite, false);
			$.set(leaseSeconds, preset.seconds, true);
		}
	}

	function loadDecodeExample(example) {
		$.set(activeTab, 'decode');
		$.set(hexInput, example.hexValue, true);
	}

	// Build mode effect
	$.user_effect(() => {
		if ($.get(activeTab) !== 'build') return;

		const currentSeconds = $.get(leaseSeconds);
		const currentInfinite = $.get(infinite);

		untrack(() => {
			const config = { leaseSeconds: currentSeconds, infinite: currentInfinite };

			$.set(buildErrors, validateLeaseTimeConfig(config), true);

			// Build even with warnings
			try {
				$.set(buildResult, buildLeaseTimeOption(config), true);
			} catch(err) {
				$.set(buildErrors, [err instanceof Error ? err.message : 'Unknown error'], true);
				$.set(buildResult, null);
			}
		});
	});

	// Decode mode effect
	$.user_effect(() => {
		if ($.get(activeTab) !== 'decode') return;

		const currentHex = $.get(hexInput);

		untrack(() => {
			if (!currentHex.trim()) {
				$.set(decodeResult, null);
				$.set(decodeError, '');

				return;
			}

			try {
				$.set(decodeResult, decodeLeaseTimeOption(currentHex), true);
				$.set(decodeError, '');
			} catch(err) {
				$.set(decodeError, err instanceof Error ? err.message : 'Unknown error', true);
				$.set(decodeResult, null);
			}
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCP Option 51 - IP Address Lease Time',
		description: 'Option 51 specifies the lease time in seconds for the IP address assignment. T1 (renewal at 50%) and T2 (rebinding at 87.5%) timers are automatically calculated.',
		get navOptions() {
			return navOptions;
		},

		get selectedNav() {
			return $.get(activeTab);
		},

		set selectedNav($$value) {
			$.set(activeTab, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_6();
					var node_1 = $.first_child(fragment_2);

					ExamplesCard(node_1, {
						get examples() {
							return examples;
						},
						onSelect: loadPreset,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div = $.sibling(node_1, 2);
					var div_1 = $.sibling($.child(div), 2);
					var label = $.child(div_1);
					var input = $.child(label);

					$.remove_input_defaults(input);
					$.next();
					$.reset(label);
					$.next(2);
					$.reset(div_1);

					var node_2 = $.sibling(div_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_3 = root_1();
							var div_2 = $.first_child(fragment_3);
							var input_1 = $.sibling($.child(div_2), 2);

							$.remove_input_defaults(input_1);

							var node_3 = $.sibling(input_1, 2);

							{
								var consequent = ($$anchor) => {
									var span = root();
									var text = $.only_child(span);

									$.template_effect(($0) => $.set_text(text, `= ${$0 ?? ''}`), [() => formatTime($.get(leaseSeconds))]);
									$.append($$anchor, span);
								};

								$.if(node_3, ($$render) => {
									if ($.get(leaseSeconds) > 0) $$render(consequent);
								});
							}

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var button = $.sibling($.child(div_3), 2);
							var button_1 = $.sibling(button, 2);
							var button_2 = $.sibling(button_1, 2);
							var button_3 = $.sibling(button_2, 2);
							var button_4 = $.sibling(button_3, 2);

							$.reset(div_3);
							$.bind_value(input_1, () => $.get(leaseSeconds), ($$value) => $.set(leaseSeconds, $$value));
							$.delegated('click', button, () => $.set(leaseSeconds, 3600));
							$.delegated('click', button_1, () => $.set(leaseSeconds, 14400));
							$.delegated('click', button_2, () => $.set(leaseSeconds, 86400));
							$.delegated('click', button_3, () => $.set(leaseSeconds, 259200));
							$.delegated('click', button_4, () => $.set(leaseSeconds, 604800));
							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if (!$.get(infinite)) $$render(consequent_1);
						});
					}

					var node_4 = $.sibling(node_2, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_4 = root_3();
							let classes;
							var strong = $.child(div_4);
							var text_1 = $.only_child(strong, true);
							var ul = $.sibling(strong, 2);

							$.each(ul, 21, () => $.get(buildErrors), $.index, ($$anchor, error) => {
								var li = root_2();
								var text_2 = $.only_child(li, true);

								$.template_effect(() => $.set_text(text_2, $.get(error)));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_4);

							$.template_effect(
								($0, $1) => {
									classes = $.set_class(div_4, 1, 'error-card svelte-bhzrvk', null, classes, { warning: $0 });
									$.set_text(text_1, $1);
								},
								[
									() => $.get(buildErrors).every((e) => e.startsWith('Warning:')),
									() => $.get(buildErrors).some((e) => e.startsWith('Warning:')) ? 'Warnings:' : 'Validation Errors:'
								]
							);

							$.append($$anchor, div_4);
						};

						$.if(node_4, ($$render) => {
							if ($.get(buildErrors).length > 0) $$render(consequent_2);
						});
					}

					$.reset(div);

					var node_5 = $.sibling(div, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_5 = root_5();
							var div_6 = $.sibling($.child(div_5), 2);
							var div_7 = $.child(div_6);
							var span_1 = $.sibling($.child(div_7), 2);
							var text_3 = $.only_child(span_1, true);

							$.reset(div_7);

							var div_8 = $.sibling(div_7, 2);
							var code = $.sibling($.child(div_8), 2);
							var text_4 = $.only_child(code, true);
							var button_5 = $.sibling(code, 2);
							let classes_1;
							var text_5 = $.only_child(button_5, true);

							$.reset(div_8);

							var div_9 = $.sibling(div_8, 2);
							var code_1 = $.sibling($.child(div_9), 2);
							var text_6 = $.only_child(code_1, true);
							var button_6 = $.sibling(code_1, 2);
							let classes_2;
							var text_7 = $.only_child(button_6, true);

							$.reset(div_9);

							var div_10 = $.sibling(div_9, 2);
							var span_2 = $.sibling($.child(div_10), 2);
							var text_8 = $.only_child(span_2);

							$.reset(div_10);

							var node_6 = $.sibling(div_10, 2);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_4 = root_4();
									var div_11 = $.first_child(fragment_4);
									var span_3 = $.sibling($.child(div_11), 2);
									var text_9 = $.only_child(span_3);

									$.reset(div_11);

									var div_12 = $.sibling(div_11, 2);
									var span_4 = $.sibling($.child(div_12), 2);
									var text_10 = $.only_child(span_4);

									$.reset(div_12);

									$.template_effect(() => {
										$.set_text(text_9, `${$.get(buildResult).t1RenewalFormatted ?? ''} (50% of lease)`);
										$.set_text(text_10, `${$.get(buildResult).t2RebindingFormatted ?? ''} (87.5% of lease)`);
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_6, ($$render) => {
									if (!$.get(buildResult).isInfinite) $$render(consequent_3);
								});
							}

							$.reset(div_6);

							var div_13 = $.sibling(div_6, 2);
							var div_14 = $.sibling($.child(div_13), 2);
							var div_15 = $.child(div_14);
							var button_7 = $.sibling($.child(div_15), 2);
							let classes_3;
							var text_11 = $.only_child(button_7, true);

							$.reset(div_15);

							var pre = $.sibling(div_15, 2);
							var code_2 = $.child(pre);
							var text_12 = $.only_child(code_2, true);

							$.reset(pre);
							$.reset(div_14);

							var div_16 = $.sibling(div_14, 2);
							var div_17 = $.child(div_16);
							var button_8 = $.sibling($.child(div_17), 2);
							let classes_4;
							var text_13 = $.only_child(button_8, true);

							$.reset(div_17);

							var pre_1 = $.sibling(div_17, 2);
							var code_3 = $.child(pre_1);
							var text_14 = $.only_child(code_3, true);

							$.reset(pre_1);
							$.reset(div_16);

							var div_18 = $.sibling(div_16, 2);
							var div_19 = $.child(div_18);
							var button_9 = $.sibling($.child(div_19), 2);
							let classes_5;
							var text_15 = $.only_child(button_9, true);

							$.reset(div_19);

							var pre_2 = $.sibling(div_19, 2);
							var code_4 = $.child(pre_2);
							var text_16 = $.only_child(code_4, true);

							$.reset(pre_2);
							$.reset(div_18);
							$.reset(div_13);
							$.reset(div_5);

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
									$.set_text(text_3, $.get(buildResult).humanReadable);
									$.set_text(text_4, $.get(buildResult).hexEncoded);
									classes_1 = $.set_class(button_5, 1, 'btn-copy svelte-bhzrvk', null, classes_1, { copied: $0 });
									$.set_text(text_5, $1);
									$.set_text(text_6, $.get(buildResult).wireFormat);
									classes_2 = $.set_class(button_6, 1, 'btn-copy svelte-bhzrvk', null, classes_2, { copied: $2 });
									$.set_text(text_7, $3);
									$.set_text(text_8, `${$.get(buildResult).totalLength ?? ''} bytes`);
									classes_3 = $.set_class(button_7, 1, 'btn-copy svelte-bhzrvk', null, classes_3, { copied: $4 });
									$.set_text(text_11, $5);
									$.set_text(text_12, $.get(buildResult).configExamples.iscDhcpd);
									classes_4 = $.set_class(button_8, 1, 'btn-copy svelte-bhzrvk', null, classes_4, { copied: $6 });
									$.set_text(text_13, $7);
									$.set_text(text_14, $.get(buildResult).configExamples.keaDhcp4);
									classes_5 = $.set_class(button_9, 1, 'btn-copy svelte-bhzrvk', null, classes_5, { copied: $8 });
									$.set_text(text_15, $9);
									$.set_text(text_16, $.get(buildResult).configExamples.dnsmasq);
								},
								[
									() => clipboard.isCopied('build-hex'),
									() => clipboard.isCopied('build-hex') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('build-wire'),
									() => clipboard.isCopied('build-wire') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('build-isc'),
									() => clipboard.isCopied('build-isc') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('build-kea'),
									() => clipboard.isCopied('build-kea') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('build-dnsmasq'),
									() => clipboard.isCopied('build-dnsmasq') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_5, () => clipboard.copy($.get(buildResult).hexEncoded, 'build-hex'));
							$.delegated('click', button_6, () => clipboard.copy($.get(buildResult).wireFormat, 'build-wire'));
							$.delegated('click', button_7, () => clipboard.copy($.get(buildResult).configExamples.iscDhcpd, 'build-isc'));
							$.delegated('click', button_8, () => clipboard.copy($.get(buildResult).configExamples.keaDhcp4, 'build-kea'));
							$.delegated('click', button_9, () => clipboard.copy($.get(buildResult).configExamples.dnsmasq, 'build-dnsmasq'));
							$.append($$anchor, div_5);
						};

						$.if(node_5, ($$render) => {
							if ($.get(buildResult)) $$render(consequent_4);
						});
					}

					$.bind_checked(input, () => $.get(infinite), ($$value) => $.set(infinite, $$value));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_5 = root_10();
					var node_7 = $.first_child(fragment_5);

					ExamplesCard(node_7, {
						get examples() {
							return decodeExamples;
						},
						onSelect: loadDecodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div_20 = $.sibling(node_7, 2);
					var div_21 = $.sibling($.child(div_20), 2);
					var input_2 = $.sibling($.child(div_21), 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_21);

					var node_8 = $.sibling(div_21, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_22 = root_7();
							var p = $.sibling($.child(div_22), 2);
							var text_17 = $.only_child(p, true);

							$.reset(div_22);
							$.template_effect(() => $.set_text(text_17, $.get(decodeError)));
							$.append($$anchor, div_22);
						};

						$.if(node_8, ($$render) => {
							if ($.get(decodeError)) $$render(consequent_6);
						});
					}

					$.reset(div_20);

					var node_9 = $.sibling(div_20, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_23 = root_9();
							var div_24 = $.sibling($.child(div_23), 2);
							var div_25 = $.child(div_24);
							var span_5 = $.sibling($.child(div_25), 2);
							var text_18 = $.only_child(span_5, true);

							$.reset(div_25);

							var div_26 = $.sibling(div_25, 2);
							var span_6 = $.sibling($.child(div_26), 2);
							var text_19 = $.only_child(span_6, true);

							$.reset(div_26);

							var node_10 = $.sibling(div_26, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_27 = root_8();

									$.append($$anchor, div_27);
								};

								$.if(node_10, ($$render) => {
									if ($.get(decodeResult).isInfinite) $$render(consequent_7);
								});
							}

							var node_11 = $.sibling(node_10, 2);

							{
								var consequent_8 = ($$anchor) => {
									var fragment_6 = root_4();
									var div_28 = $.first_child(fragment_6);
									var span_7 = $.sibling($.child(div_28), 2);
									var text_20 = $.only_child(span_7);

									$.reset(div_28);

									var div_29 = $.sibling(div_28, 2);
									var span_8 = $.sibling($.child(div_29), 2);
									var text_21 = $.only_child(span_8);

									$.reset(div_29);

									$.template_effect(() => {
										$.set_text(text_20, `${$.get(decodeResult).t1RenewalFormatted ?? ''} (50% of lease)`);
										$.set_text(text_21, `${$.get(decodeResult).t2RebindingFormatted ?? ''} (87.5% of lease)`);
									});

									$.append($$anchor, fragment_6);
								};

								$.if(node_11, ($$render) => {
									if (!$.get(decodeResult).isInfinite) $$render(consequent_8);
								});
							}

							$.reset(div_24);

							var div_30 = $.sibling(div_24, 2);
							var div_31 = $.sibling($.child(div_30), 2);
							var div_32 = $.child(div_31);
							var button_10 = $.sibling($.child(div_32), 2);
							let classes_6;
							var text_22 = $.only_child(button_10, true);

							$.reset(div_32);

							var pre_3 = $.sibling(div_32, 2);
							var code_5 = $.child(pre_3);
							var text_23 = $.only_child(code_5, true);

							$.reset(pre_3);
							$.reset(div_31);

							var div_33 = $.sibling(div_31, 2);
							var div_34 = $.child(div_33);
							var button_11 = $.sibling($.child(div_34), 2);
							let classes_7;
							var text_24 = $.only_child(button_11, true);

							$.reset(div_34);

							var pre_4 = $.sibling(div_34, 2);
							var code_6 = $.child(pre_4);
							var text_25 = $.only_child(code_6, true);

							$.reset(pre_4);
							$.reset(div_33);

							var div_35 = $.sibling(div_33, 2);
							var div_36 = $.child(div_35);
							var button_12 = $.sibling($.child(div_36), 2);
							let classes_8;
							var text_26 = $.only_child(button_12, true);

							$.reset(div_36);

							var pre_5 = $.sibling(div_36, 2);
							var code_7 = $.child(pre_5);
							var text_27 = $.only_child(code_7, true);

							$.reset(pre_5);
							$.reset(div_35);
							$.reset(div_30);
							$.reset(div_23);

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6) => {
									$.set_text(text_18, $.get(decodeResult).humanReadable);
									$.set_text(text_19, $0);
									classes_6 = $.set_class(button_10, 1, 'btn-copy svelte-bhzrvk', null, classes_6, { copied: $1 });
									$.set_text(text_22, $2);
									$.set_text(text_23, $.get(decodeResult).configExamples.iscDhcpd);
									classes_7 = $.set_class(button_11, 1, 'btn-copy svelte-bhzrvk', null, classes_7, { copied: $3 });
									$.set_text(text_24, $4);
									$.set_text(text_25, $.get(decodeResult).configExamples.keaDhcp4);
									classes_8 = $.set_class(button_12, 1, 'btn-copy svelte-bhzrvk', null, classes_8, { copied: $5 });
									$.set_text(text_26, $6);
									$.set_text(text_27, $.get(decodeResult).configExamples.dnsmasq);
								},
								[
									() => $.get(decodeResult).leaseSeconds.toLocaleString(),
									() => clipboard.isCopied('decode-isc'),
									() => clipboard.isCopied('decode-isc') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('decode-kea'),
									() => clipboard.isCopied('decode-kea') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('decode-dnsmasq'),
									() => clipboard.isCopied('decode-dnsmasq') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_10, () => clipboard.copy($.get(decodeResult).configExamples.iscDhcpd, 'decode-isc'));
							$.delegated('click', button_11, () => clipboard.copy($.get(decodeResult).configExamples.keaDhcp4, 'decode-kea'));
							$.delegated('click', button_12, () => clipboard.copy($.get(decodeResult).configExamples.dnsmasq, 'decode-dnsmasq'));
							$.append($$anchor, div_23);
						};

						$.if(node_9, ($$render) => {
							if ($.get(decodeResult)) $$render(consequent_9);
						});
					}

					$.bind_value(input_2, () => $.get(hexInput), ($$value) => $.set(hexInput, $$value));
					$.append($$anchor, fragment_5);
				};

				$.if(node, ($$render) => {
					if ($.get(activeTab) === 'build') $$render(consequent_5); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);