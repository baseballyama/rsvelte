import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { processIPv6ZoneIdentifiers } from '$lib/utils/ipv6-zone-id.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="loading svelte-14hmdqi"><!> Processing addresses...</div>`);
var root_1 = $.from_html(`<div class="error-item svelte-14hmdqi"> </div>`);
var root_2 = $.from_html(`<div class="errors svelte-14hmdqi"><h3 class="svelte-14hmdqi"><!> Errors</h3> <!></div>`);
var root_3 = $.from_html(`<span class="zone-status valid svelte-14hmdqi"><!> Valid</span>`);
var root_4 = $.from_html(`<span class="zone-status invalid svelte-14hmdqi"><!> Invalid</span>`);
var root_5 = $.from_html(`<div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Zone ID:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi"> </code> <button type="button" title="Copy zone ID"><!></button></div> <!></div>`);
var root_6 = $.from_html(`<div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Zone ID:</span> <span class="no-zone svelte-14hmdqi">None</span></div>`);
var root_7 = $.from_html(`<button type="button" title="Copy full address"><code class="svelte-14hmdqi"> </code> <!></button>`);
var root_8 = $.from_html(`<div class="suggested-zones svelte-14hmdqi"><h4 class="svelte-14hmdqi">Suggested Zone Identifiers:</h4> <div class="zones-list svelte-14hmdqi"></div></div>`);
var root_9 = $.from_html(`<div class="zone-warning svelte-14hmdqi"><!> This address type typically requires a zone identifier for proper routing</div>`);
var root_10 = $.from_html(`<div class="processing-details svelte-14hmdqi"><div class="address-breakdown svelte-14hmdqi"><div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Address:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi"> </code> <button type="button" title="Copy address"><!></button></div></div> <!></div> <div class="address-classification svelte-14hmdqi"><div class="classification-item svelte-14hmdqi"><span class="classification-label svelte-14hmdqi">Address Type:</span> <span class="address-type svelte-14hmdqi"><!> </span></div> <div class="classification-item svelte-14hmdqi"><span class="classification-label svelte-14hmdqi">Requires Zone ID:</span> <span> </span></div></div> <div class="processing-results svelte-14hmdqi"><div class="result-item svelte-14hmdqi"><span class="result-label svelte-14hmdqi">With Zone:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi"> </code> <button type="button" title="Copy with zone"><!></button></div></div> <div class="result-item svelte-14hmdqi"><span class="result-label svelte-14hmdqi">Without Zone:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi"> </code> <button type="button" title="Copy without zone"><!></button></div></div></div> <!> <!></div>`);
var root_11 = $.from_html(`<div class="error-message svelte-14hmdqi"><!> </div>`);
var root_12 = $.from_html(`<div><div class="card-header row svelte-14hmdqi"><div class="address-info svelte-14hmdqi"><div class="original-input svelte-14hmdqi"><span class="input-label svelte-14hmdqi">Input:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi"> </code> <button type="button" title="Copy input"><!></button></div></div></div> <div class="status svelte-14hmdqi"><!></div></div> <!></div>`);
var root_13 = $.from_html(`<div class="summary svelte-14hmdqi"><h3 class="svelte-14hmdqi">Processing Summary</h3> <div class="summary-stats svelte-14hmdqi"><div class="stat svelte-14hmdqi"><span class="stat-value svelte-14hmdqi"> </span> <span class="stat-label svelte-14hmdqi">Total Inputs</span></div> <div class="stat valid svelte-14hmdqi"><span class="stat-value svelte-14hmdqi"> </span> <span class="stat-label svelte-14hmdqi">Valid</span></div> <div class="stat invalid svelte-14hmdqi"><span class="stat-value svelte-14hmdqi"> </span> <span class="stat-label svelte-14hmdqi">Invalid</span></div> <div class="stat with-zone svelte-14hmdqi"><span class="stat-value svelte-14hmdqi"> </span> <span class="stat-label svelte-14hmdqi">With Zones</span></div> <div class="stat require-zone svelte-14hmdqi"><span class="stat-value svelte-14hmdqi"> </span> <span class="stat-label svelte-14hmdqi">Require Zones</span></div></div></div> <div class="processings"><div class="processings-header svelte-14hmdqi"><h3 class="svelte-14hmdqi">Zone ID Processing</h3> <div class="export-buttons svelte-14hmdqi"><button class="svelte-14hmdqi"><!> Export CSV</button> <button class="svelte-14hmdqi"><!> Export JSON</button></div></div> <div class="processings-list svelte-14hmdqi"></div></div>`, 1);
var root_14 = $.from_html(`<div class="results svelte-14hmdqi"><!> <!></div>`);

var root_15 = $.from_html(`<div class="card svelte-14hmdqi"><header class="card-header svelte-14hmdqi"><h2 class="svelte-14hmdqi">IPv6 Zone ID Handler</h2> <p class="svelte-14hmdqi">Process IPv6 addresses with zone identifiers for link-local and multicast addresses</p></header> <div class="input-section svelte-14hmdqi"><div class="input-group svelte-14hmdqi"><label for="inputs" class="svelte-14hmdqi">IPv6 Addresses</label> <textarea id="inputs" placeholder="fe80::1
fe80::1%eth0
fe80::1234:5678:90ab:cdef%wlan0
::1
2001:db8::1" rows="6" class="svelte-14hmdqi"></textarea> <div class="input-help svelte-14hmdqi">Enter IPv6 addresses with or without zone identifiers (%). Zone IDs are interface names like eth0, wlan0, or
        numeric IDs.</div></div> <div class="zone-info svelte-14hmdqi"><h3 class="svelte-14hmdqi">Zone Identifier Information</h3> <div class="info-section svelte-14hmdqi"><h4 class="svelte-14hmdqi">When Zone IDs are Required:</h4> <ul class="svelte-14hmdqi"><li class="svelte-14hmdqi"><strong>Link-local addresses</strong> (fe80::/10) - Almost always require zone IDs</li> <li class="svelte-14hmdqi"><strong>Multicast addresses</strong> (ff00::/8) - May require zone IDs depending on scope</li></ul></div> <div class="info-section svelte-14hmdqi"><h4 class="svelte-14hmdqi">Common Zone Identifiers:</h4> <div class="zone-examples svelte-14hmdqi"><code class="svelte-14hmdqi">eth0</code> <code class="svelte-14hmdqi">wlan0</code> <code class="svelte-14hmdqi">en0</code> <code class="svelte-14hmdqi">lo</code> <code class="svelte-14hmdqi">%1</code> <code class="svelte-14hmdqi">%2</code></div></div></div></div> <!> <!></div>`);

export default function IPv6ZoneID($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('fe80::1\nfe80::1%eth0\nfe80::1234:5678:90ab:cdef%wlan0\n::1\n2001:db8::1\nff02::1%eth0');
	let result = $.state(null);
	let isLoading = $.state(false);
	const clipboard = useClipboard();

	function processAddresses() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

			$.set(result, processIPv6ZoneIdentifiers(inputs), true);
		} catch(error) {
			$.set(
				result,
				{
					processings: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						addressesWithZones: 0,
						addressesRequiringZones: 0
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
			const headers = 'Input,Has Zone ID,Address,Zone ID,Address Type,Requires Zone ID,With Zone,Without Zone,Valid,Error';
			const rows = $.get(result).processings.map((proc) => `"${proc.input}","${proc.hasZoneId}","${proc.address}","${proc.zoneId}","${proc.addressType}","${proc.requiresZoneId}","${proc.processing.withZone}","${proc.processing.withoutZone}","${proc.isValid}","${proc.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `ipv6-zones-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `ipv6-zones-${timestamp}.json`;
		}

		const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function getAddressTypeColor(type) {
		switch (type) {
			case 'link-local':
				return 'var(--color-warning)';

			case 'unique-local':
				return 'var(--color-purple)';

			case 'multicast':
				return 'var(--color-error)';

			case 'global':
				return 'var(--color-success)';

			case 'loopback':
				return 'var(--color-info)';

			case 'unspecified':
				return 'var(--text-secondary)';

			default:
				return 'var(--text-primary)';
		}
	}

	function getAddressTypeDescription(type) {
		switch (type) {
			case 'link-local':
				return 'Link-local address (fe80::/10)';

			case 'unique-local':
				return 'Unique local address (fc00::/7)';

			case 'multicast':
				return 'Multicast address (ff00::/8)';

			case 'global':
				return 'Global unicast address';

			case 'loopback':
				return 'Loopback address (::1)';

			case 'unspecified':
				return 'Unspecified address (::)';

			default:
				return 'Unknown address type';
		}
	}

	// Auto-process when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(processAddresses, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_15();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var textarea = $.sibling($.child(div_2), 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_2);
	$.next(2);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			Icon(node_1, { name: 'loader' });
			$.next();
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_4 = root_14();
			var node_3 = $.child(div_4);

			{
				var consequent_1 = ($$anchor) => {
					var div_5 = root_2();
					var h3 = $.child(div_5);
					var node_4 = $.child(h3);

					Icon(node_4, { name: 'alert-triangle' });
					$.next();
					$.reset(h3);

					var node_5 = $.sibling(h3, 2);

					$.each(node_5, 16, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var div_6 = root_1();
						var text = $.only_child(div_6, true);

						$.template_effect(() => $.set_text(text, error));
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_6 = $.sibling(node_3, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment = root_13();
					var div_7 = $.first_child(fragment);
					var div_8 = $.sibling($.child(div_7), 2);
					var div_9 = $.child(div_8);
					var span = $.child(div_9);
					var text_1 = $.only_child(span, true);

					$.next(2);
					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var span_1 = $.child(div_10);
					var text_2 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_10);

					var div_11 = $.sibling(div_10, 2);
					var span_2 = $.child(div_11);
					var text_3 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var span_3 = $.child(div_12);
					var text_4 = $.only_child(span_3, true);

					$.next(2);
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var span_4 = $.child(div_13);
					var text_5 = $.only_child(span_4, true);

					$.next(2);
					$.reset(div_13);
					$.reset(div_8);
					$.reset(div_7);

					var div_14 = $.sibling(div_7, 2);
					var div_15 = $.child(div_14);
					var div_16 = $.sibling($.child(div_15), 2);
					var button = $.child(div_16);
					var node_7 = $.child(button);

					Icon(node_7, { name: 'csv-file' });
					$.next();
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_8 = $.child(button_1);

					Icon(node_8, { name: 'json-file' });
					$.next();
					$.reset(button_1);
					$.reset(div_16);
					$.reset(div_15);

					var div_17 = $.sibling(div_15, 2);

					$.each(div_17, 21, () => $.get(result)?.processings || [], (processing) => processing.input, ($$anchor, processing) => {
						var div_18 = root_12();
						let classes;
						var div_19 = $.child(div_18);
						var div_20 = $.child(div_19);
						var div_21 = $.child(div_20);
						var div_22 = $.sibling($.child(div_21), 2);
						var code = $.child(div_22);
						var text_6 = $.only_child(code, true);
						var button_2 = $.sibling(code, 2);
						let classes_1;
						var node_9 = $.child(button_2);

						{
							let $0 = $.derived(() => clipboard.isCopied(`input-${$.get(processing).input}`) ? 'check' : 'copy');

							Icon(node_9, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_2);
						$.reset(div_22);
						$.reset(div_21);
						$.reset(div_20);

						var div_23 = $.sibling(div_20, 2);
						var node_10 = $.child(div_23);

						{
							var consequent_2 = ($$anchor) => {
								Icon($$anchor, { name: 'check-circle' });
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, { name: 'x-circle' });
							};

							$.if(node_10, ($$render) => {
								if ($.get(processing).isValid) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(div_23);
						$.reset(div_19);

						var node_11 = $.sibling(div_19, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_24 = root_10();
								var div_25 = $.child(div_24);
								var div_26 = $.child(div_25);
								var div_27 = $.sibling($.child(div_26), 2);
								var code_1 = $.child(div_27);
								var text_7 = $.only_child(code_1, true);
								var button_3 = $.sibling(code_1, 2);
								let classes_2;
								var node_12 = $.child(button_3);

								{
									let $0 = $.derived(() => clipboard.isCopied(`address-${$.get(processing).address}`) ? 'check' : 'copy');

									Icon(node_12, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_3);
								$.reset(div_27);
								$.reset(div_26);

								var node_13 = $.sibling(div_26, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_28 = root_5();
										var div_29 = $.sibling($.child(div_28), 2);
										var code_2 = $.child(div_29);
										var text_8 = $.only_child(code_2, true);
										var button_4 = $.sibling(code_2, 2);
										let classes_3;
										var node_14 = $.child(button_4);

										{
											let $0 = $.derived(() => clipboard.isCopied(`zone-${$.get(processing).zoneId}`) ? 'check' : 'copy');

											Icon(node_14, {
												get name() {
													return $.get($0);
												},
												size: 'xs'
											});
										}

										$.reset(button_4);
										$.reset(div_29);

										var node_15 = $.sibling(div_29, 2);

										{
											var consequent_3 = ($$anchor) => {
												var span_5 = root_3();
												var node_16 = $.child(span_5);

												Icon(node_16, { name: 'check' });
												$.next();
												$.reset(span_5);
												$.append($$anchor, span_5);
											};

											var alternate_1 = ($$anchor) => {
												var span_6 = root_4();
												var node_17 = $.child(span_6);

												Icon(node_17, { name: 'x' });
												$.next();
												$.reset(span_6);
												$.append($$anchor, span_6);
											};

											$.if(node_15, ($$render) => {
												if ($.get(processing).processing.zoneIdValid) $$render(consequent_3); else $$render(alternate_1, -1);
											});
										}

										$.reset(div_28);

										$.template_effect(
											($0) => {
												$.set_text(text_8, $.get(processing).zoneId);
												classes_3 = $.set_class(button_4, 1, 'svelte-14hmdqi', null, classes_3, { copied: $0 });
											},
											[() => clipboard.isCopied(`zone-${$.get(processing).zoneId}`)]
										);

										$.delegated('click', button_4, () => clipboard.copy($.get(processing).zoneId, `zone-${$.get(processing).zoneId}`));
										$.append($$anchor, div_28);
									};

									var alternate_2 = ($$anchor) => {
										var div_30 = root_6();

										$.append($$anchor, div_30);
									};

									$.if(node_13, ($$render) => {
										if ($.get(processing).hasZoneId) $$render(consequent_4); else $$render(alternate_2, -1);
									});
								}

								$.reset(div_25);

								var div_31 = $.sibling(div_25, 2);
								var div_32 = $.child(div_31);
								var span_7 = $.sibling($.child(div_32), 2);
								var node_18 = $.child(span_7);

								Icon(node_18, { name: 'info' });

								var text_9 = $.sibling(node_18);

								$.reset(span_7);
								$.reset(div_32);

								var div_33 = $.sibling(div_32, 2);
								var span_8 = $.sibling($.child(div_33), 2);
								let classes_4;
								var text_10 = $.only_child(span_8, true);

								$.reset(div_33);
								$.reset(div_31);

								var div_34 = $.sibling(div_31, 2);
								var div_35 = $.child(div_34);
								var div_36 = $.sibling($.child(div_35), 2);
								var code_3 = $.child(div_36);
								var text_11 = $.only_child(code_3, true);
								var button_5 = $.sibling(code_3, 2);
								let classes_5;
								var node_19 = $.child(button_5);

								{
									let $0 = $.derived(() => clipboard.isCopied(`with-zone-${$.get(processing).processing.withZone}`) ? 'check' : 'copy');

									Icon(node_19, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_5);
								$.reset(div_36);
								$.reset(div_35);

								var div_37 = $.sibling(div_35, 2);
								var div_38 = $.sibling($.child(div_37), 2);
								var code_4 = $.child(div_38);
								var text_12 = $.only_child(code_4, true);
								var button_6 = $.sibling(code_4, 2);
								let classes_6;
								var node_20 = $.child(button_6);

								{
									let $0 = $.derived(() => clipboard.isCopied(`without-zone-${$.get(processing).processing.withoutZone}`) ? 'check' : 'copy');

									Icon(node_20, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_6);
								$.reset(div_38);
								$.reset(div_37);
								$.reset(div_34);

								var node_21 = $.sibling(div_34, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_39 = root_8();
										var div_40 = $.sibling($.child(div_39), 2);

										$.each(div_40, 20, () => $.get(processing).processing.suggestedZones, (zone) => zone, ($$anchor, zone) => {
											var button_7 = root_7();
											let classes_7;
											var code_5 = $.child(button_7);
											var text_13 = $.only_child(code_5, true);
											var node_22 = $.sibling(code_5, 2);

											{
												let $0 = $.derived(() => clipboard.isCopied(`suggested-${zone}`) ? 'check' : 'copy');

												Icon(node_22, {
													get name() {
														return $.get($0);
													},
													size: 'xs'
												});
											}

											$.reset(button_7);

											$.template_effect(
												($0) => {
													classes_7 = $.set_class(button_7, 1, 'zone-button svelte-14hmdqi', null, classes_7, { copied: $0 });
													$.set_text(text_13, zone);
												},
												[() => clipboard.isCopied(`suggested-${zone}`)]
											);

											$.delegated('click', button_7, () => clipboard.copy(`${$.get(processing).address}%${zone}`, `suggested-${zone}`));
											$.append($$anchor, button_7);
										});

										$.reset(div_40);
										$.reset(div_39);
										$.append($$anchor, div_39);
									};

									$.if(node_21, ($$render) => {
										if ($.get(processing).processing.suggestedZones.length > 0) $$render(consequent_5);
									});
								}

								var node_23 = $.sibling(node_21, 2);

								{
									var consequent_6 = ($$anchor) => {
										var div_41 = root_9();
										var node_24 = $.child(div_41);

										Icon(node_24, { name: 'alert-triangle' });
										$.next();
										$.reset(div_41);
										$.append($$anchor, div_41);
									};

									$.if(node_23, ($$render) => {
										if ($.get(processing).requiresZoneId && !$.get(processing).hasZoneId) $$render(consequent_6);
									});
								}

								$.reset(div_24);

								$.template_effect(
									($0, $1, $2, $3, $4, $5) => {
										$.set_text(text_7, $.get(processing).address);
										classes_2 = $.set_class(button_3, 1, 'svelte-14hmdqi', null, classes_2, { copied: $0 });
										$.set_style(span_7, `color: ${$1 ?? ''}`);
										$.set_attribute(span_7, 'title', $2);
										$.set_text(text_9, ` ${$3 ?? ''}`);

										classes_4 = $.set_class(span_8, 1, 'zone-requirement svelte-14hmdqi', null, classes_4, {
											required: $.get(processing).requiresZoneId,
											optional: !$.get(processing).requiresZoneId
										});

										$.set_text(text_10, $.get(processing).requiresZoneId ? 'Yes' : 'No');
										$.set_text(text_11, $.get(processing).processing.withZone);
										classes_5 = $.set_class(button_5, 1, 'svelte-14hmdqi', null, classes_5, { copied: $4 });
										$.set_text(text_12, $.get(processing).processing.withoutZone);
										classes_6 = $.set_class(button_6, 1, 'svelte-14hmdqi', null, classes_6, { copied: $5 });
									},
									[
										() => clipboard.isCopied(`address-${$.get(processing).address}`),
										() => getAddressTypeColor($.get(processing).addressType),
										() => getAddressTypeDescription($.get(processing).addressType),
										() => $.get(processing).addressType.replace('-', ' ').toUpperCase(),
										() => clipboard.isCopied(`with-zone-${$.get(processing).processing.withZone}`),
										() => clipboard.isCopied(`without-zone-${$.get(processing).processing.withoutZone}`)
									]
								);

								$.delegated('click', button_3, () => clipboard.copy($.get(processing).address, `address-${$.get(processing).address}`));
								$.delegated('click', button_5, () => clipboard.copy($.get(processing).processing.withZone, `with-zone-${$.get(processing).processing.withZone}`));
								$.delegated('click', button_6, () => clipboard.copy($.get(processing).processing.withoutZone, `without-zone-${$.get(processing).processing.withoutZone}`));
								$.append($$anchor, div_24);
							};

							var alternate_3 = ($$anchor) => {
								var div_42 = root_11();
								var node_25 = $.child(div_42);

								Icon(node_25, { name: 'alert-triangle' });

								var text_14 = $.sibling(node_25);

								$.reset(div_42);
								$.template_effect(() => $.set_text(text_14, ` ${$.get(processing).error ?? ''}`));
								$.append($$anchor, div_42);
							};

							$.if(node_11, ($$render) => {
								if ($.get(processing).isValid) $$render(consequent_7); else $$render(alternate_3, -1);
							});
						}

						$.reset(div_18);

						$.template_effect(
							($0) => {
								classes = $.set_class(div_18, 1, 'processing-card svelte-14hmdqi', null, classes, {
									valid: $.get(processing).isValid,
									invalid: !$.get(processing).isValid
								});

								$.set_text(text_6, $.get(processing).input);
								classes_1 = $.set_class(button_2, 1, 'svelte-14hmdqi', null, classes_1, { copied: $0 });
							},
							[() => clipboard.isCopied(`input-${$.get(processing).input}`)]
						);

						$.delegated('click', button_2, () => clipboard.copy($.get(processing).input, `input-${$.get(processing).input}`));
						$.append($$anchor, div_18);
					});

					$.reset(div_17);
					$.reset(div_14);

					$.template_effect(() => {
						$.set_text(text_1, $.get(result).summary.totalInputs);
						$.set_text(text_2, $.get(result).summary.validInputs);
						$.set_text(text_3, $.get(result).summary.invalidInputs);
						$.set_text(text_4, $.get(result).summary.addressesWithZones);
						$.set_text(text_5, $.get(result).summary.addressesRequiringZones);
					});

					$.delegated('click', button, () => exportResults('csv'));
					$.delegated('click', button_1, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).processings.length > 0) $$render(consequent_8);
				});
			}

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($.get(result)) $$render(consequent_9);
		});
	}

	$.reset(div);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);