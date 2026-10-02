import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { convertEUI64Addresses } from '$lib/utils/eui64.js';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="loading svelte-e4iyfj"><!> Converting addresses...</div>`);
var root_1 = $.from_html(`<div class="error-item svelte-e4iyfj"> </div>`);
var root_2 = $.from_html(`<div class="errors svelte-e4iyfj"><h3 class="svelte-e4iyfj"><!> Errors</h3> <!></div>`);
var root_3 = $.from_html(`<div class="conversion-details svelte-e4iyfj"><div class="addresses-section svelte-e4iyfj"><div class="address-item svelte-e4iyfj"><span class="address-label svelte-e4iyfj">MAC Address:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj"> </code> <button type="button"><!></button></div></div> <div class="address-item svelte-e4iyfj"><span class="address-label svelte-e4iyfj">EUI-64:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj"> </code> <button type="button"><!></button></div></div></div> <div class="ipv6-section svelte-e4iyfj"><h4 class="svelte-e4iyfj">Generated IPv6 Addresses</h4> <div class="ipv6-item svelte-e4iyfj"><span class="ipv6-label svelte-e4iyfj">Link-Local:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj"> </code> <button type="button"><!></button></div></div> <div class="ipv6-item svelte-e4iyfj"><span class="ipv6-label svelte-e4iyfj">Global:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj"> </code> <button type="button"><!></button></div></div></div> <div class="properties-section svelte-e4iyfj"><h4 class="svelte-e4iyfj">Address Properties</h4> <div class="properties-grid svelte-e4iyfj"><div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">OUI Part:</span> <code class="svelte-e4iyfj"> </code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Device Part:</span> <code class="svelte-e4iyfj"> </code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Modified OUI:</span> <code class="svelte-e4iyfj"> </code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Scope:</span> <span> </span></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Type:</span> <span> </span></div></div></div></div>`);
var root_4 = $.from_html(`<div class="error-message svelte-e4iyfj"><!> </div>`);
var root_5 = $.from_html(`<div><div class="card-header svelte-e4iyfj"><div class="input-info svelte-e4iyfj"><span class="input-text svelte-e4iyfj"> </span> <div class="input-meta svelte-e4iyfj"><span class="input-type svelte-e4iyfj"> </span> <span class="conversion-direction svelte-e4iyfj"> </span></div></div> <div class="status svelte-e4iyfj"><!></div></div> <!></div>`);
var root_6 = $.from_html(`<div class="summary svelte-e4iyfj"><h3 class="svelte-e4iyfj">Conversion Summary</h3> <div class="summary-stats svelte-e4iyfj"><div class="stat svelte-e4iyfj"><span class="stat-value svelte-e4iyfj"> </span> <span class="stat-label svelte-e4iyfj">Total Inputs</span></div> <div class="stat valid svelte-e4iyfj"><span class="stat-value svelte-e4iyfj"> </span> <span class="stat-label svelte-e4iyfj">Valid</span></div> <div class="stat invalid svelte-e4iyfj"><span class="stat-value svelte-e4iyfj"> </span> <span class="stat-label svelte-e4iyfj">Invalid</span></div> <div class="stat mac-to-eui svelte-e4iyfj"><span class="stat-value svelte-e4iyfj"> </span> <span class="stat-label svelte-e4iyfj">MAC → EUI-64</span></div> <div class="stat eui-to-mac svelte-e4iyfj"><span class="stat-value svelte-e4iyfj"> </span> <span class="stat-label svelte-e4iyfj">EUI-64 → MAC</span></div></div></div> <div class="conversions"><div class="conversions-header svelte-e4iyfj"><h3 class="svelte-e4iyfj">Address Conversions</h3> <div class="export-buttons svelte-e4iyfj"><button class="svelte-e4iyfj"><!> Export CSV</button> <button class="svelte-e4iyfj"><!> Export JSON</button></div></div> <div class="conversions-list svelte-e4iyfj"></div></div>`, 1);
var root_7 = $.from_html(`<div class="results svelte-e4iyfj"><!> <!></div>`);

var root_8 = $.from_html(`<div class="card"><header class="card-header svelte-e4iyfj"><h2>EUI-64 Converter</h2> <p>Convert between MAC addresses and IPv6 EUI-64 interface identifiers with automatic IPv6 address generation</p></header> <div class="input-section svelte-e4iyfj"><div class="inputs-section svelte-e4iyfj"><h3 class="svelte-e4iyfj">Address Conversion</h3> <div class="input-group svelte-e4iyfj"><label for="inputs" class="svelte-e4iyfj">MAC Addresses or EUI-64 Identifiers</label> <textarea id="inputs" placeholder="00:1A:2B:3C:4D:5E
02:1A:2B:FF:FE:3C:4D:5F
08:00:27:12:34:56" rows="6" class="svelte-e4iyfj"></textarea> <div class="input-help svelte-e4iyfj">Enter MAC addresses (48-bit) or EUI-64 identifiers (64-bit) one per line. Various formats supported:
          xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx</div></div> <div class="input-group svelte-e4iyfj"><label for="prefix" class="svelte-e4iyfj">IPv6 Global Prefix (Optional)</label> <input id="prefix" type="text" placeholder="2001:db8::/64" class="svelte-e4iyfj"/> <div class="input-help svelte-e4iyfj">IPv6 prefix for generating global unicast addresses. Leave empty to use example prefix.</div></div></div> <div class="info-section svelte-e4iyfj"><h3 class="svelte-e4iyfj">EUI-64 Information</h3> <div class="info-content svelte-e4iyfj"><p class="svelte-e4iyfj"><strong>EUI-64</strong> (Extended Unique Identifier 64-bit) is used to generate IPv6 interface identifiers from
          MAC addresses:</p> <ul class="svelte-e4iyfj"><li class="svelte-e4iyfj">Split MAC address: OUI (24 bits) + Device ID (24 bits)</li> <li class="svelte-e4iyfj">Insert FFFE between OUI and Device ID</li> <li class="svelte-e4iyfj">Flip the Universal/Local bit (bit 1) in the first octet</li> <li class="svelte-e4iyfj">Result: 64-bit interface identifier for IPv6</li></ul></div></div></div> <!> <!></div>`);

export default function EUI64($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('00:1A:2B:3C:4D:5E\n02:1A:2B:FF:FE:3C:4D:5F\n08:00:27:12:34:56\n0A:00:27:FF:FE:12:34:57');
	let globalPrefix = $.state('2001:db8::/64');
	let result = $.state(null);
	let isLoading = $.state(false);
	const clipboard = useClipboard();

	function convertAddresses() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());
			const prefix = $.get(globalPrefix).trim() || undefined;

			$.set(result, convertEUI64Addresses(inputs, prefix), true);
		} catch(error) {
			$.set(
				result,
				{
					conversions: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						macToEUI64: 0,
						eui64ToMAC: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error']
				},
				true
			);
		} finally {
			$.set(isLoading, false);
		}
	}

	function exportResults(format) {
		if (!$.get(result)) return;

		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
		let content = '';
		let filename = '';

		if (format === 'csv') {
			const headers = 'Input,Type,MAC Address,EUI-64,IPv6 Link-Local,IPv6 Global,Universal/Local,Unicast/Multicast,Valid,Error';
			const rows = $.get(result).conversions.map((conv) => `"${conv.input}","${conv.inputType.toUpperCase()}","${conv.macAddress}","${conv.eui64Address}","${conv.ipv6LinkLocal}","${conv.ipv6Global}","${conv.details.universalLocal}","${conv.details.unicastMulticast}","${conv.isValid}","${conv.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `eui64-conversions-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `eui64-conversions-${timestamp}.json`;
		}

		const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Auto-convert when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(convertAddresses, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_8();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var label = $.child(div_3);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
		text: 'Enter MAC addresses (48-bit) or EUI-64 identifiers (64-bit)',
		position: 'top'
	}));

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var label_1 = $.child(div_4);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
		text: 'IPv6 network prefix for generating global addresses (e.g., 2001:db8::/64)',
		position: 'top'
	}));

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_4);
	$.reset(div_2);
	$.next(2);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_5 = root();
			var node_1 = $.child(div_5);

			Icon(node_1, { name: 'loader' });
			$.next();
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_6 = root_7();
			var node_3 = $.child(div_6);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_2();
					var h3 = $.child(div_7);
					var node_4 = $.child(h3);

					Icon(node_4, { name: 'alert-triangle' });
					$.next();
					$.reset(h3);

					var node_5 = $.sibling(h3, 2);

					$.each(node_5, 16, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var div_8 = root_1();
						var text = $.only_child(div_8, true);

						$.template_effect(() => $.set_text(text, error));
						$.append($$anchor, div_8);
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_3, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_6 = $.sibling(node_3, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment = root_6();
					var div_9 = $.first_child(fragment);
					var div_10 = $.sibling($.child(div_9), 2);
					var div_11 = $.child(div_10);
					var span = $.child(div_11);
					var text_1 = $.only_child(span, true);

					$.next(2);
					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var span_1 = $.child(div_12);
					var text_2 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var span_2 = $.child(div_13);
					var text_3 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var span_3 = $.child(div_14);
					var text_4 = $.only_child(span_3, true);

					$.next(2);
					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var span_4 = $.child(div_15);
					var text_5 = $.only_child(span_4, true);

					$.next(2);
					$.reset(div_15);
					$.reset(div_10);
					$.reset(div_9);

					var div_16 = $.sibling(div_9, 2);
					var div_17 = $.child(div_16);
					var div_18 = $.sibling($.child(div_17), 2);
					var button = $.child(div_18);
					var node_7 = $.child(button);

					Icon(node_7, { name: 'download' });
					$.next();
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_8 = $.child(button_1);

					Icon(node_8, { name: 'download' });
					$.next();
					$.reset(button_1);
					$.reset(div_18);
					$.reset(div_17);

					var div_19 = $.sibling(div_17, 2);

					$.each(div_19, 21, () => $.get(result).conversions, (conversion) => conversion.input, ($$anchor, conversion) => {
						var div_20 = root_5();
						let classes;
						var div_21 = $.child(div_20);
						var div_22 = $.child(div_21);
						var span_5 = $.child(div_22);
						var text_6 = $.only_child(span_5, true);
						var div_23 = $.sibling(span_5, 2);
						var span_6 = $.child(div_23);
						var text_7 = $.only_child(span_6, true);
						var span_7 = $.sibling(span_6, 2);
						var text_8 = $.only_child(span_7, true);

						$.reset(div_23);
						$.reset(div_22);

						var div_24 = $.sibling(div_22, 2);
						var node_9 = $.child(div_24);

						{
							var consequent_2 = ($$anchor) => {
								Icon($$anchor, { name: 'check-circle' });
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, { name: 'x-circle' });
							};

							$.if(node_9, ($$render) => {
								if ($.get(conversion).isValid) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(div_24);
						$.reset(div_21);

						var node_10 = $.sibling(div_21, 2);

						{
							var consequent_3 = ($$anchor) => {
								var div_25 = root_3();
								var div_26 = $.child(div_25);
								var div_27 = $.child(div_26);
								var div_28 = $.sibling($.child(div_27), 2);
								var code = $.child(div_28);
								var text_9 = $.only_child(code, true);
								var button_2 = $.sibling(code, 2);
								let classes_1;
								var node_11 = $.child(button_2);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).macAddress) ? 'check' : 'copy');

									Icon(node_11, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_2);
								$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_28);
								$.reset(div_27);

								var div_29 = $.sibling(div_27, 2);
								var div_30 = $.sibling($.child(div_29), 2);
								var code_1 = $.child(div_30);
								var text_10 = $.only_child(code_1, true);
								var button_3 = $.sibling(code_1, 2);
								let classes_2;
								var node_12 = $.child(button_3);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).eui64Address) ? 'check' : 'copy');

									Icon(node_12, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_3);
								$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_30);
								$.reset(div_29);
								$.reset(div_26);

								var div_31 = $.sibling(div_26, 2);
								var div_32 = $.sibling($.child(div_31), 2);
								var div_33 = $.sibling($.child(div_32), 2);
								var code_2 = $.child(div_33);
								var text_11 = $.only_child(code_2, true);
								var button_4 = $.sibling(code_2, 2);
								let classes_3;
								var node_13 = $.child(button_4);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).ipv6LinkLocal) ? 'check' : 'copy');

									Icon(node_13, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_4);
								$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_33);
								$.reset(div_32);

								var div_34 = $.sibling(div_32, 2);
								var div_35 = $.sibling($.child(div_34), 2);
								var code_3 = $.child(div_35);
								var text_12 = $.only_child(code_3, true);
								var button_5 = $.sibling(code_3, 2);
								let classes_4;
								var node_14 = $.child(button_5);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).ipv6Global) ? 'check' : 'copy');

									Icon(node_14, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_5);
								$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_35);
								$.reset(div_34);
								$.reset(div_31);

								var div_36 = $.sibling(div_31, 2);
								var div_37 = $.sibling($.child(div_36), 2);
								var div_38 = $.child(div_37);
								var code_4 = $.sibling($.child(div_38), 2);
								var text_13 = $.only_child(code_4, true);

								$.reset(div_38);

								var div_39 = $.sibling(div_38, 2);
								var code_5 = $.sibling($.child(div_39), 2);
								var text_14 = $.only_child(code_5, true);

								$.reset(div_39);

								var div_40 = $.sibling(div_39, 2);
								var code_6 = $.sibling($.child(div_40), 2);
								var text_15 = $.only_child(code_6, true);

								$.reset(div_40);

								var div_41 = $.sibling(div_40, 2);
								var span_8 = $.sibling($.child(div_41), 2);
								let classes_5;
								var text_16 = $.only_child(span_8, true);

								$.reset(div_41);

								var div_42 = $.sibling(div_41, 2);
								var span_9 = $.sibling($.child(div_42), 2);
								let classes_6;
								var text_17 = $.only_child(span_9, true);

								$.reset(div_42);
								$.reset(div_37);
								$.reset(div_36);
								$.reset(div_25);

								$.template_effect(
									($0, $1, $2, $3, $4, $5) => {
										$.set_text(text_9, $.get(conversion).macAddress);
										classes_1 = $.set_class(button_2, 1, 'btn btn-icon btn-xs svelte-e4iyfj', null, classes_1, { copied: $0 });
										$.set_text(text_10, $.get(conversion).eui64Address);
										classes_2 = $.set_class(button_3, 1, 'btn btn-icon btn-xs svelte-e4iyfj', null, classes_2, { copied: $1 });
										$.set_text(text_11, $.get(conversion).ipv6LinkLocal);
										classes_3 = $.set_class(button_4, 1, 'btn btn-icon btn-xs svelte-e4iyfj', null, classes_3, { copied: $2 });
										$.set_text(text_12, $.get(conversion).ipv6Global);
										classes_4 = $.set_class(button_5, 1, 'btn btn-icon btn-xs svelte-e4iyfj', null, classes_4, { copied: $3 });
										$.set_text(text_13, $.get(conversion).details.ouiPart);
										$.set_text(text_14, $.get(conversion).details.devicePart);
										$.set_text(text_15, $.get(conversion).details.modifiedOUI);

										classes_5 = $.set_class(span_8, 1, 'property-value svelte-e4iyfj', null, classes_5, {
											universal: $.get(conversion).details.universalLocal === 'universal',
											local: $.get(conversion).details.universalLocal === 'local'
										});

										$.set_text(text_16, $4);

										classes_6 = $.set_class(span_9, 1, 'property-value svelte-e4iyfj', null, classes_6, {
											unicast: $.get(conversion).details.unicastMulticast === 'unicast',
											multicast: $.get(conversion).details.unicastMulticast === 'multicast'
										});

										$.set_text(text_17, $5);
									},
									[
										() => clipboard.isCopied($.get(conversion).macAddress),
										() => clipboard.isCopied($.get(conversion).eui64Address),
										() => clipboard.isCopied($.get(conversion).ipv6LinkLocal),
										() => clipboard.isCopied($.get(conversion).ipv6Global),
										() => $.get(conversion).details.universalLocal.toUpperCase(),
										() => $.get(conversion).details.unicastMulticast.toUpperCase()
									]
								);

								$.delegated('click', button_2, () => clipboard.copy($.get(conversion).macAddress, $.get(conversion).macAddress));
								$.delegated('click', button_3, () => clipboard.copy($.get(conversion).eui64Address, $.get(conversion).eui64Address));
								$.delegated('click', button_4, () => clipboard.copy($.get(conversion).ipv6LinkLocal, $.get(conversion).ipv6LinkLocal));
								$.delegated('click', button_5, () => clipboard.copy($.get(conversion).ipv6Global, $.get(conversion).ipv6Global));
								$.append($$anchor, div_25);
							};

							var alternate_1 = ($$anchor) => {
								var div_43 = root_4();
								var node_15 = $.child(div_43);

								Icon(node_15, { name: 'alert-triangle' });

								var text_18 = $.sibling(node_15);

								$.reset(div_43);
								$.template_effect(() => $.set_text(text_18, ` ${$.get(conversion).error ?? ''}`));
								$.append($$anchor, div_43);
							};

							$.if(node_10, ($$render) => {
								if ($.get(conversion).isValid) $$render(consequent_3); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_20);

						$.template_effect(
							($0) => {
								classes = $.set_class(div_20, 1, 'conversion-card svelte-e4iyfj', null, classes, {
									valid: $.get(conversion).isValid,
									invalid: !$.get(conversion).isValid
								});

								$.set_text(text_6, $.get(conversion).input);
								$.set_text(text_7, $0);
								$.set_text(text_8, $.get(conversion).inputType === 'mac' ? 'MAC → EUI-64' : 'EUI-64 → MAC');
							},
							[() => $.get(conversion).inputType.toUpperCase()]
						);

						$.append($$anchor, div_20);
					});

					$.reset(div_19);
					$.reset(div_16);

					$.template_effect(() => {
						$.set_text(text_1, $.get(result).summary.totalInputs);
						$.set_text(text_2, $.get(result).summary.validInputs);
						$.set_text(text_3, $.get(result).summary.invalidInputs);
						$.set_text(text_4, $.get(result).summary.macToEUI64);
						$.set_text(text_5, $.get(result).summary.eui64ToMAC);
					});

					$.delegated('click', button, () => exportResults('csv'));
					$.delegated('click', button_1, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).conversions.length > 0) $$render(consequent_4);
				});
			}

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_2, ($$render) => {
			if ($.get(result)) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.bind_value(input, () => $.get(globalPrefix), ($$value) => $.set(globalPrefix, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);