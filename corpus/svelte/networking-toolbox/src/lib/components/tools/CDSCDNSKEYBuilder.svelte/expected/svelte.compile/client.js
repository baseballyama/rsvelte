import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

import {
	parseDNSKEYRecord,
	validateDNSKEY,
	generateCDSRecords,
	generateCDNSKEYRecord,
	formatCDSRecord,
	formatCDNSKEYRecord,
	validateCDSCDNSKEYUsage,
	DNSSEC_ALGORITHMS,
	DS_DIGEST_TYPES
} from '$lib/utils/dnssec';

var root = $.from_html(`<p class="field-help svelte-1kxph8y">Using example data - modify to see your results</p>`);
var root_1 = $.from_html(`<div class="card error-card svelte-1kxph8y"><div class="error-content svelte-1kxph8y"><!> <div class="svelte-1kxph8y"><strong class="svelte-1kxph8y">Error:</strong> </div></div></div>`);
var root_2 = $.from_html(`<li class="svelte-1kxph8y"> </li>`);
var root_3 = $.from_html(`<div class="card warning-card svelte-1kxph8y"><div class="warning-content svelte-1kxph8y"><!> <div class="svelte-1kxph8y"><strong class="svelte-1kxph8y">Warnings:</strong> <ul class="warning-list svelte-1kxph8y"></ul></div></div></div>`);
var root_4 = $.from_html(`<div class="loading svelte-1kxph8y"><div class="spinner svelte-1kxph8y"></div> <span class="svelte-1kxph8y">Generating records...</span></div>`);
var root_5 = $.from_html(`<div class="status success svelte-1kxph8y"><!> <span class="svelte-1kxph8y">Records generated</span></div>`);
var root_6 = $.from_html(`<div class="record-item svelte-1kxph8y"><div class="record-content svelte-1kxph8y"><div class="record-text mono svelte-1kxph8y"> </div> <div class="record-meta svelte-1kxph8y"> </div></div> <button><!></button></div>`);
var root_7 = $.from_html(`<div class="record-section svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDS Records (for parent zone):</h4> <div class="record-list svelte-1kxph8y"></div></div>`);
var root_8 = $.from_html(`<div class="record-section svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDNSKEY Record (for child zone):</h4> <div class="record-list svelte-1kxph8y"><div class="record-item svelte-1kxph8y"><div class="record-content svelte-1kxph8y"><div class="record-text mono svelte-1kxph8y"> </div> <div class="record-meta svelte-1kxph8y">Copy this to your child zone</div></div> <button><!></button></div></div></div>`);
var root_9 = $.from_html(`<div class="card records-card svelte-1kxph8y"><div class="records-header svelte-1kxph8y"><h3 class="svelte-1kxph8y">Generated Records</h3> <button><!> Copy All</button></div> <!> <!></div>`);
var root_10 = $.from_html(`<div class="card dnskey-info-card svelte-1kxph8y"><div class="card-section-header svelte-1kxph8y"><h3 class="svelte-1kxph8y">DNSKEY Information</h3></div> <div class="info-grid svelte-1kxph8y"><div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Key Tag</span> <span class="info-value mono svelte-1kxph8y"> </span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Algorithm</span> <span class="info-value mono svelte-1kxph8y"> </span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Key Type</span> <span class="info-value mono svelte-1kxph8y"> </span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Flags</span> <span class="info-value mono svelte-1kxph8y"> </span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Protocol</span> <span class="info-value mono svelte-1kxph8y"> </span></div></div></div> <div class="card status-card svelte-1kxph8y"><div class="status-content svelte-1kxph8y"><div class="status-item svelte-1kxph8y"><!></div> <div class="status-summary svelte-1kxph8y"><p class="svelte-1kxph8y"> </p> <p class="svelte-1kxph8y"> </p></div></div></div> <!>`, 1);

var root_11 = $.from_html(`<div class="card svelte-1kxph8y"><header class="card-header svelte-1kxph8y"><h1 class="svelte-1kxph8y">CDS/CDNSKEY Builder</h1> <p class="svelte-1kxph8y">Build CDS/CDNSKEY RRs from child DNSKEYs to enable automated DS updates at the parent. These records allow child
      zones to signal DS record changes to parent zones for automated DNSSEC maintenance.</p></header> <div class="card input-card svelte-1kxph8y"><div class="form-group svelte-1kxph8y"><label for="dnskey-input" class="svelte-1kxph8y"><!> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.org. 3600 IN DNSKEY 257 3 8 AwEAAc..." rows="4"></textarea> <!></div> <div class="form-group svelte-1kxph8y"><label for="owner-name" class="svelte-1kxph8y"><!> Owner Name</label> <input id="owner-name" placeholder="example.org." class="owner-input svelte-1kxph8y"/></div> <div class="form-group svelte-1kxph8y"><div class="checkbox-group svelte-1kxph8y"><label class="checkbox-label svelte-1kxph8y"><input type="checkbox" class="styled-checkbox svelte-1kxph8y"/> Generate CDS Records</label> <label class="checkbox-label svelte-1kxph8y"><input type="checkbox" class="styled-checkbox svelte-1kxph8y"/> Generate CDNSKEY Record</label></div></div></div> <!> <!> <!> <div class="education-card svelte-1kxph8y"><div class="education-grid svelte-1kxph8y"><div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDS Records</h4> <p class="svelte-1kxph8y">CDS (Child DS) records are placed in the child zone to signal DS record changes to the parent. Parents can
          automatically process these to update DS records in their zone.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDNSKEY Records</h4> <p class="svelte-1kxph8y">CDNSKEY (Child DNSKEY) records are copies of DNSKEYs placed in the child zone. Parents can use these to
          generate DS records automatically using their preferred digest algorithm.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">RFC 8078 Automation</h4> <p class="svelte-1kxph8y">These records enable automated DS maintenance as defined in RFC 8078. This reduces manual coordination between
          child and parent zones during key rollover.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">Implementation Notes</h4> <p class="svelte-1kxph8y">Always use KSK (Key Signing Key) records for CDS/CDNSKEY generation. Verify parent support for automated DS
          updates before relying on this mechanism.</p></div></div></div></div>`);

export default function CDSCDNSKEYBuilder($$anchor, $$props) {
	$.push($$props, true);

	let dnskeyInput = $.state('example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...');
	let ownerName = $.state('example.org.');
	let generateCDS = $.state(true);
	let generateCDNSKEY = $.state(true);
	let isActiveExample = $.state(true);

	let results = $.state($.proxy({
		error: null,
		dnskey: null,
		cdsRecords: [],
		cdnskeyRecord: null,
		warnings: []
	}));

	let isGenerating = $.state(false);
	let copiedStates = $.proxy({});

	function calculateResults() {
		if (!$.get(dnskeyInput).trim()) {
			$.set(
				results,
				{
					error: null,
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				},
				true
			);

			return;
		}

		const validation = validateDNSKEY($.get(dnskeyInput));

		if (!validation.valid) {
			$.set(
				results,
				{
					error: validation.error || 'Invalid DNSKEY record',
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				},
				true
			);

			return;
		}

		const dnskey = parseDNSKEYRecord($.get(dnskeyInput));

		if (!dnskey) {
			$.set(
				results,
				{
					error: 'Failed to parse DNSKEY record',
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				},
				true
			);

			return;
		}

		const usageValidation = validateCDSCDNSKEYUsage(dnskey);
		const cdnskeyRecord = $.get(generateCDNSKEY) ? generateCDNSKEYRecord(dnskey) : null;

		$.set(
			results,
			{
				error: null,
				dnskey,
				cdsRecords: [],
				cdnskeyRecord,
				warnings: usageValidation.warnings
			},
			true
		);

		generateRecordsAsync();
	}

	async function generateRecordsAsync() {
		if (!$.get(results).dnskey || !$.get(ownerName).trim()) return;

		$.set(isGenerating, true);

		try {
			if ($.get(generateCDS)) {
				const cdsRecords = await generateCDSRecords($.get(results).dnskey, $.get(ownerName));

				$.get(results).cdsRecords = cdsRecords;
			} else {
				$.get(results).cdsRecords = [];
			}
		} catch(err) {
			console.error('Error generating CDS records:', err);
			$.get(results).cdsRecords = [];
		} finally {
			$.set(isGenerating, false);
		}
	}

	async function copyToClipboard(text, key) {
		try {
			await navigator.clipboard.writeText(text);
			copiedStates[key] = true;

			setTimeout(
				() => {
					copiedStates[key] = false;
				},
				2000
			);
		} catch(err) {
			console.error('Failed to copy:', err);
		}
	}

	function copyAllRecords() {
		const records = [];

		if ($.get(generateCDS) && $.get(results).cdsRecords.length > 0) {
			records.push('# CDS Records');

			$.get(results).cdsRecords.forEach((cds) => {
				records.push(formatCDSRecord(cds, $.get(ownerName)));
			});
		}

		if ($.get(generateCDNSKEY) && $.get(results).cdnskeyRecord) {
			if (records.length > 0) records.push('');

			records.push('# CDNSKEY Record');
			records.push(formatCDNSKEYRecord($.get(results).cdnskeyRecord, $.get(ownerName)));
		}

		copyToClipboard(records.join('\n'), 'all');
	}

	function handleInputChange() {
		if ($.get(isActiveExample) && $.get(dnskeyInput) !== 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...') {
			$.set(isActiveExample, false);
		}

		calculateResults();
	}

	// Initialize
	calculateResults();

	var div = root_11();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var label = $.child(div_2);
	var node = $.child(label);

	Icon(node, { name: 'key', size: 'sm' });
	$.next();
	$.reset(label);

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);

	var node_1 = $.sibling(textarea, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isActiveExample)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var label_1 = $.child(div_3);
	var node_2 = $.child(label_1);

	Icon(node_2, { name: 'dns', size: 'sm' });
	$.next();
	$.reset(label_1);

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var label_2 = $.child(div_5);
	var input_1 = $.child(label_2);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_2 = $.child(label_3);

	$.remove_input_defaults(input_2);
	$.next();
	$.reset(label_3);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_6 = root_1();
			var div_7 = $.child(div_6);
			var node_4 = $.child(div_7);

			Icon(node_4, { name: 'alert-triangle', size: 'sm' });

			var div_8 = $.sibling(node_4, 2);
			var text_1 = $.sibling($.child(div_8));

			$.reset(div_8);
			$.reset(div_7);
			$.reset(div_6);
			$.template_effect(() => $.set_text(text_1, ` ${$.get(results).error ?? ''}`));
			$.append($$anchor, div_6);
		};

		$.if(node_3, ($$render) => {
			if ($.get(results).error) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_9 = root_3();
			var div_10 = $.child(div_9);
			var node_6 = $.child(div_10);

			Icon(node_6, { name: 'alert-triangle', size: 'sm' });

			var div_11 = $.sibling(node_6, 2);
			var ul = $.sibling($.child(div_11), 2);

			$.each(ul, 20, () => $.get(results).warnings, (warning) => warning, ($$anchor, warning) => {
				var li = root_2();
				var text_2 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_2, warning));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_11);
			$.reset(div_10);
			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_5, ($$render) => {
			if ($.get(results).warnings.length > 0) $$render(consequent_2);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_7 = ($$anchor) => {
			var fragment = root_10();
			var div_12 = $.first_child(fragment);
			var div_13 = $.sibling($.child(div_12), 2);
			var div_14 = $.child(div_13);
			var span = $.sibling($.child(div_14), 2);
			var text_3 = $.only_child(span, true);

			$.reset(div_14);

			var div_15 = $.sibling(div_14, 2);
			var span_1 = $.sibling($.child(div_15), 2);
			var text_4 = $.only_child(span_1);

			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var span_2 = $.sibling($.child(div_16), 2);
			var text_5 = $.only_child(span_2, true);

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var span_3 = $.sibling($.child(div_17), 2);
			var text_6 = $.only_child(span_3, true);

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var span_4 = $.sibling($.child(div_18), 2);
			var text_7 = $.only_child(span_4, true);

			$.reset(div_18);
			$.reset(div_13);
			$.reset(div_12);

			var div_19 = $.sibling(div_12, 2);
			var div_20 = $.child(div_19);
			var div_21 = $.child(div_20);
			var node_8 = $.child(div_21);

			{
				var consequent_3 = ($$anchor) => {
					var div_22 = root_4();

					$.append($$anchor, div_22);
				};

				var alternate = ($$anchor) => {
					var div_23 = root_5();
					var node_9 = $.child(div_23);

					Icon(node_9, { name: 'check-circle', size: 'sm' });
					$.next(2);
					$.reset(div_23);
					$.append($$anchor, div_23);
				};

				$.if(node_8, ($$render) => {
					if ($.get(isGenerating)) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.reset(div_21);

			var div_24 = $.sibling(div_21, 2);
			var p_1 = $.child(div_24);
			var text_8 = $.only_child(p_1);
			var p_2 = $.sibling(p_1, 2);
			var text_9 = $.only_child(p_2);

			$.reset(div_24);
			$.reset(div_20);
			$.reset(div_19);

			var node_10 = $.sibling(div_19, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_25 = root_9();
					var div_26 = $.child(div_25);
					var button = $.sibling($.child(div_26), 2);
					var node_11 = $.child(button);

					{
						let $0 = $.derived(() => copiedStates.all ? 'check' : 'copy');

						Icon(node_11, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button);
					$.reset(div_26);

					var node_12 = $.sibling(div_26, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_27 = root_7();
							var div_28 = $.sibling($.child(div_27), 2);

							$.each(div_28, 23, () => $.get(results).cdsRecords, (cds) => cds.digest, ($$anchor, cds, i) => {
								var div_29 = root_6();
								var div_30 = $.child(div_29);
								var div_31 = $.child(div_30);
								var text_10 = $.only_child(div_31, true);
								var div_32 = $.sibling(div_31, 2);
								var text_11 = $.only_child(div_32);

								$.reset(div_30);

								var button_1 = $.sibling(div_30, 2);
								var node_13 = $.child(button_1);

								{
									let $0 = $.derived(() => copiedStates[`cds-${$.get(i)}`] ? 'check' : 'copy');

									Icon(node_13, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_1);
								$.reset(div_29);

								$.template_effect(
									($0) => {
										$.set_text(text_10, $0);
										$.set_text(text_11, `${DS_DIGEST_TYPES[$.get(cds).digestType] ?? ''} digest`);
										$.set_class(button_1, 1, `copy-button-small ${copiedStates[`cds-${$.get(i)}`] ? 'copied' : ''}`, 'svelte-1kxph8y');
									},
									[() => formatCDSRecord($.get(cds), $.get(ownerName))]
								);

								$.delegated('click', button_1, () => copyToClipboard(formatCDSRecord($.get(cds), $.get(ownerName)), `cds-${$.get(i)}`));
								$.append($$anchor, div_29);
							});

							$.reset(div_28);
							$.reset(div_27);
							$.append($$anchor, div_27);
						};

						$.if(node_12, ($$render) => {
							if ($.get(generateCDS) && $.get(results).cdsRecords.length > 0) $$render(consequent_4);
						});
					}

					var node_14 = $.sibling(node_12, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_33 = root_8();
							var div_34 = $.sibling($.child(div_33), 2);
							var div_35 = $.child(div_34);
							var div_36 = $.child(div_35);
							var div_37 = $.child(div_36);
							var text_12 = $.only_child(div_37, true);

							$.next(2);
							$.reset(div_36);

							var button_2 = $.sibling(div_36, 2);
							var node_15 = $.child(button_2);

							{
								let $0 = $.derived(() => copiedStates.cdnskey ? 'check' : 'copy');

								Icon(node_15, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							$.reset(button_2);
							$.reset(div_35);
							$.reset(div_34);
							$.reset(div_33);

							$.template_effect(
								($0) => {
									$.set_text(text_12, $0);
									$.set_class(button_2, 1, `copy-button-small ${copiedStates.cdnskey ? 'copied' : ''}`, 'svelte-1kxph8y');
								},
								[
									() => formatCDNSKEYRecord($.get(results).cdnskeyRecord, $.get(ownerName))
								]
							);

							$.delegated('click', button_2, () => $.get(results).cdnskeyRecord && copyToClipboard(formatCDNSKEYRecord($.get(results).cdnskeyRecord, $.get(ownerName)), 'cdnskey'));
							$.append($$anchor, div_33);
						};

						$.if(node_14, ($$render) => {
							if ($.get(generateCDNSKEY) && $.get(results).cdnskeyRecord) $$render(consequent_5);
						});
					}

					$.reset(div_25);
					$.template_effect(() => $.set_class(button, 1, `copy-button ${copiedStates.all ? 'copied' : ''}`, 'svelte-1kxph8y'));
					$.delegated('click', button, copyAllRecords);
					$.append($$anchor, div_25);
				};

				$.if(node_10, ($$render) => {
					if ($.get(generateCDS) && $.get(results).cdsRecords.length > 0 || $.get(generateCDNSKEY) && $.get(results).cdnskeyRecord) $$render(consequent_6);
				});
			}

			$.template_effect(() => {
				$.set_text(text_3, $.get(results).dnskey.keyTag || 'Calculating...');
				$.set_text(text_4, `${$.get(results).dnskey.algorithm ?? ''} (${(DNSSEC_ALGORITHMS[$.get(results).dnskey.algorithm] || 'Unknown') ?? ''})`);
				$.set_text(text_5, $.get(results).dnskey.keyType || 'Unknown');
				$.set_text(text_6, $.get(results).dnskey.flags);
				$.set_text(text_7, $.get(results).dnskey.protocol);

				$.set_text(text_8, `CDS: ${$.get(generateCDS)
					? `${$.get(results).cdsRecords.length} records`
					: 'Disabled'}`);

				$.set_text(text_9, `CDNSKEY: ${$.get(generateCDNSKEY) ? '1 record' : 'Disabled'}`);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_7, ($$render) => {
			if ($.get(results).dnskey) $$render(consequent_7);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_class(textarea, 1, `dnskey-input ${$.get(isActiveExample) ? 'example-active' : ''}`, 'svelte-1kxph8y'));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(dnskeyInput), ($$value) => $.set(dnskeyInput, $$value));
	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(ownerName), ($$value) => $.set(ownerName, $$value));
	$.delegated('change', input_1, handleInputChange);
	$.bind_checked(input_1, () => $.get(generateCDS), ($$value) => $.set(generateCDS, $$value));
	$.delegated('change', input_2, handleInputChange);
	$.bind_checked(input_2, () => $.get(generateCDNSKEY), ($$value) => $.set(generateCDNSKEY, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'change', 'click']);