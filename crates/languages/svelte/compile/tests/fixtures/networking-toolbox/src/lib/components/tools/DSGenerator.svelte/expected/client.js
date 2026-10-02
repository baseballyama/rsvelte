import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	parseDNSKEYRecord,
	generateDSRecord,
	validateDNSKEY,
	formatDSRecord,
	DNSSEC_ALGORITHMS,
	DS_DIGEST_TYPES
} from '$lib/utils/dnssec';

import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<button><div class="example-title svelte-t5ue2i"> </div> <div class="example-owner svelte-t5ue2i">Owner: <code> </code></div> <div class="example-dnskey svelte-t5ue2i"><code class="svelte-t5ue2i"> </code></div></button>`);
var root_1 = $.from_html(`<span class="recommended-badge svelte-t5ue2i">Recommended</span>`);
var root_2 = $.from_html(`<label><input type="checkbox" class="svelte-t5ue2i"/> <span class="checkmark svelte-t5ue2i"></span> <div class="option-info svelte-t5ue2i"><span class="digest-name svelte-t5ue2i"> </span> <!></div></label>`);
var root_3 = $.from_html(`<!> <span>Generating DS Records...</span>`, 1);
var root_4 = $.from_html(`<!> <span>Generate DS Records</span>`, 1);
var root_5 = $.from_html(`<div class="card error svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><!> <h3 class="svelte-t5ue2i">Generation Error</h3></div> <p> </p></div>`);
var root_6 = $.from_html(`<div class="ds-record svelte-t5ue2i"><div class="ds-header svelte-t5ue2i"><div class="digest-info svelte-t5ue2i"><span class="digest-type svelte-t5ue2i"> </span> <span class="key-tag svelte-t5ue2i"> </span></div> <button title="Copy this DS record"><!></button></div> <div class="ds-content svelte-t5ue2i"><code class="svelte-t5ue2i"> </code></div> <div class="ds-details svelte-t5ue2i"><div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Algorithm:</span> <span class="value svelte-t5ue2i"> </span></div> <div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Digest Type:</span> <span class="value svelte-t5ue2i"> </span></div> <div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Digest:</span> <span class="value digest svelte-t5ue2i"> </span></div></div></div>`);
var root_7 = $.from_html(`<div class="results"><div class="card success svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><div class="header-content svelte-t5ue2i"><!> <h3 class="svelte-t5ue2i">Generated DS Records</h3></div> <button title="Copy all DS records"><!> Copy All</button></div> <div class="ds-records svelte-t5ue2i"></div></div></div>`);

var root_8 = $.from_html(`<div class="card"><header class="card-header"><h1>DS Record Generator</h1> <p>Generate DS records (SHA-1/256/384) from a DNSKEY or public key, with copyable output for parent zone submission.</p></header> <div class="card examples-card svelte-t5ue2i"><details class="examples-details svelte-t5ue2i"><summary class="examples-summary svelte-t5ue2i"><!> <h4 class="svelte-t5ue2i">DNSKEY Examples</h4></summary> <div class="examples-grid svelte-t5ue2i"></div></details></div> <div class="card input-card svelte-t5ue2i"><div class="input-form-layout svelte-t5ue2i"><div class="inputs-section svelte-t5ue2i"><div class="input-group svelte-t5ue2i"><label for="owner-input" class="svelte-t5ue2i"><!> Owner Name (FQDN)</label> <input id="owner-input" type="text" placeholder="example.com." class="svelte-t5ue2i"/></div> <div class="input-group svelte-t5ue2i"><label for="dnskey-input" class="svelte-t5ue2i"><!> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.com. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwr..." rows="3" class="svelte-t5ue2i"></textarea></div></div> <div class="digest-section svelte-t5ue2i"><div class="digest-header svelte-t5ue2i"><!> <span>Digest Types</span></div> <div class="digest-options svelte-t5ue2i"></div></div></div> <button><!></button></div> <!> <!> <div class="info-cards svelte-t5ue2i"><div class="card info svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">DS Record Purpose</h4></div> <p class="svelte-t5ue2i">DS (Delegation Signer) records are published in the parent zone to establish a secure delegation to the child
        zone. They contain a hash of the child's KSK (Key Signing Key) and enable DNSSEC validators to verify the
        authenticity of the child zone's DNSKEY records.</p></div> <div class="card warning svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">Digest Algorithm Recommendations</h4></div> <p class="svelte-t5ue2i"><strong>SHA-256 and SHA-384</strong> are recommended for new deployments. <strong>SHA-1</strong> is deprecated but
        may still be required for compatibility with older systems. Most registrars accept multiple DS records with different
        digest types for redundancy.</p></div> <div class="card info svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">Parent Zone Submission</h4></div> <p class="svelte-t5ue2i">Submit the generated DS records to your parent zone operator (registrar for TLDs, hosting provider for
        subdomains). The DS records must be published in the parent zone before enabling DNSSEC signing in the child
        zone to maintain the chain of trust.</p></div></div></div>`);

export default function DSGenerator($$anchor, $$props) {
	$.push($$props, true);

	let dnskeyInput = $.state('');
	let ownerName = $.state('example.com.');
	let selectedDigestTypes = $.state($.proxy([2] // SHA-256 by default
	));
	let activeExampleIndex = $.state(-1);

	const examples = [
		{
			title: 'KSK for Root Zone',
			dnskey: '. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			owner: '.'
		},

		{
			title: 'Example.com KSK',
			dnskey: 'example.com. IN DNSKEY 257 3 13 kC1gJ+0qtVgdl0VAO/6t9vRaB15v4PclEV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			owner: 'example.com.'
		},

		{
			title: 'Subdomain KSK',
			dnskey: 'secure.example.org. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			owner: 'secure.example.org.'
		}
	];

	const digestTypeOptions = [
		{ value: 1, label: 'SHA-1', recommended: false },
		{ value: 2, label: 'SHA-256', recommended: true },
		{ value: 4, label: 'SHA-384', recommended: true }
	];

	let generatingDS = $.state(false);
	let dsRecords = $.state($.proxy([]));
	let error = $.state(null);
	const clipboard = useClipboard();

	async function generateDS() {
		$.set(error, null);
		$.set(dsRecords, [], true);
		$.set(generatingDS, true);

		try {
			const validation = validateDNSKEY($.get(dnskeyInput));

			if (!validation.valid) {
				$.set(error, validation.error || 'Invalid DNSKEY', true);

				return;
			}

			const dnskey = parseDNSKEYRecord($.get(dnskeyInput));

			if (!dnskey) {
				$.set(error, 'Failed to parse DNSKEY record');

				return;
			}

			const normalizedOwner = $.get(ownerName).trim() || 'example.com.';
			const records = [];

			for (const digestType of $.get(selectedDigestTypes)) {
				const ds = await generateDSRecord(dnskey, normalizedOwner, digestType);

				if (ds) {
					records.push(ds);
				}
			}

			$.set(dsRecords, records, true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Failed to generate DS records', true);
		} finally {
			$.set(generatingDS, false);
		}
	}

	const isValid = $.derived(() => () => {
		return $.get(dnskeyInput).trim() && $.get(ownerName).trim() && $.get(selectedDigestTypes).length > 0;
	});

	function loadExample(index) {
		const example = examples[index];

		$.set(dnskeyInput, example.dnskey, true);
		$.set(ownerName, example.owner, true);
		$.set(activeExampleIndex, index, true);
		generateDS();
	}

	function handleInput() {
		$.set(activeExampleIndex, -1);
		$.set(error, null);
		$.set(dsRecords, [], true);

		if ($.get(isValid)()) {
			generateDS();
		}
	}

	function toggleDigestType(type) {
		if ($.get(selectedDigestTypes).includes(type)) {
			$.set(selectedDigestTypes, $.get(selectedDigestTypes).filter((t) => t !== type), true);
		} else {
			$.set(selectedDigestTypes, [...$.get(selectedDigestTypes), type], true);
		}

		if ($.get(isValid)()) {
			generateDS();
		}
	}

	function copyDS(ds) {
		const formatted = formatDSRecord(ds, $.get(ownerName));
		const key = `ds-${ds.keyTag}-${ds.digestType}`;

		clipboard.copy(formatted, key);
	}

	function copyAllDS() {
		const formatted = $.get(dsRecords).map((ds) => formatDSRecord(ds, $.get(ownerName))).join('\n');

		clipboard.copy(formatted, 'all');
	}

	var div = root_8();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var div_3 = $.child(button);
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var code = $.sibling($.child(div_4));
		var text_1 = $.only_child(code, true);

		$.reset(div_4);

		var div_5 = $.sibling(div_4, 2);
		var code_1 = $.child(div_5);
		var text_2 = $.only_child(code_1, true);

		$.reset(div_5);
		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card svelte-t5ue2i', null, classes, { active: $.get(activeExampleIndex) === i });
			$.set_text(text, $.get(example).title);
			$.set_text(text_1, $.get(example).owner);
			$.set_text(text_2, $.get(example).dnskey);
		});

		$.delegated('click', button, () => loadExample(i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var div_9 = $.child(div_8);
	var label = $.child(div_9);
	var node_1 = $.child(label);

	Icon(node_1, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label);

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var label_1 = $.child(div_10);
	var node_2 = $.child(label_1);

	Icon(node_2, { name: 'key', size: 'sm' });
	$.next();
	$.reset(label_1);

	var textarea = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_10);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var div_12 = $.child(div_11);
	var node_3 = $.child(div_12);

	Icon(node_3, { name: 'hash', size: 'sm' });
	$.next(2);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);

	$.each(div_13, 21, () => digestTypeOptions, (option) => option.value, ($$anchor, option) => {
		var label_2 = root_2();
		let classes_1;
		var input_1 = $.child(label_2);

		$.remove_input_defaults(input_1);

		var div_14 = $.sibling(input_1, 4);
		var span = $.child(div_14);
		var text_3 = $.only_child(span, true);
		var node_4 = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				var span_1 = root_1();

				$.append($$anchor, span_1);
			};

			$.if(node_4, ($$render) => {
				if ($.get(option).recommended) $$render(consequent);
			});
		}

		$.reset(div_14);
		$.reset(label_2);

		$.template_effect(
			($0) => {
				classes_1 = $.set_class(label_2, 1, 'digest-option svelte-t5ue2i', null, classes_1, { recommended: $.get(option).recommended });
				$.set_checked(input_1, $0);
				$.set_text(text_3, $.get(option).label);
			},
			[
				() => $.get(selectedDigestTypes).includes($.get(option).value)
			]
		);

		$.delegated('change', input_1, () => toggleDigestType($.get(option).value));
		$.append($$anchor, label_2);
	});

	$.reset(div_13);
	$.reset(div_11);
	$.reset(div_7);

	var button_1 = $.sibling(div_7, 2);
	let classes_2;
	var node_5 = $.child(button_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_3();
			var node_6 = $.first_child(fragment);

			Icon(node_6, { name: 'loader', size: 'sm' });
			$.next(2);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_4();
			var node_7 = $.first_child(fragment_1);

			Icon(node_7, { name: 'shield', size: 'sm' });
			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node_5, ($$render) => {
			if ($.get(generatingDS)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_6);

	var node_8 = $.sibling(div_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_15 = root_5();
			var div_16 = $.child(div_15);
			var node_9 = $.child(div_16);

			Icon(node_9, { name: 'alert-triangle' });
			$.next(2);
			$.reset(div_16);

			var p = $.sibling(div_16, 2);
			var text_4 = $.only_child(p, true);

			$.reset(div_15);
			$.template_effect(() => $.set_text(text_4, $.get(error)));
			$.append($$anchor, div_15);
		};

		$.if(node_8, ($$render) => {
			if ($.get(error)) $$render(consequent_2);
		});
	}

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_17 = root_7();
			var div_18 = $.child(div_17);
			var div_19 = $.child(div_18);
			var div_20 = $.child(div_19);
			var node_11 = $.child(div_20);

			Icon(node_11, { name: 'shield' });
			$.next(2);
			$.reset(div_20);

			var button_2 = $.sibling(div_20, 2);
			let classes_3;
			var node_12 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied('all') ? 'check' : 'copy');

				Icon(node_12, {
					get name() {
						return $.get($0);
					}
				});
			}

			$.next();
			$.reset(button_2);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);

			$.each(div_21, 21, () => $.get(dsRecords), (ds) => `${ds.keyTag}-${ds.digestType}`, ($$anchor, ds) => {
				var div_22 = root_6();
				var div_23 = $.child(div_22);
				var div_24 = $.child(div_23);
				var span_2 = $.child(div_24);
				var text_5 = $.only_child(span_2, true);
				var span_3 = $.sibling(span_2, 2);
				var text_6 = $.only_child(span_3);

				$.reset(div_24);

				var button_3 = $.sibling(div_24, 2);
				let classes_4;
				var node_13 = $.child(button_3);

				{
					let $0 = $.derived(() => clipboard.isCopied(`ds-${$.get(ds).keyTag}-${$.get(ds).digestType}`) ? 'check' : 'copy');

					Icon(node_13, {
						get name() {
							return $.get($0);
						}
					});
				}

				$.reset(button_3);
				$.reset(div_23);

				var div_25 = $.sibling(div_23, 2);
				var code_2 = $.child(div_25);
				var text_7 = $.only_child(code_2, true);

				$.reset(div_25);

				var div_26 = $.sibling(div_25, 2);
				var div_27 = $.child(div_26);
				var span_4 = $.sibling($.child(div_27), 2);
				var text_8 = $.only_child(span_4);

				$.reset(div_27);

				var div_28 = $.sibling(div_27, 2);
				var span_5 = $.sibling($.child(div_28), 2);
				var text_9 = $.only_child(span_5);

				$.reset(div_28);

				var div_29 = $.sibling(div_28, 2);
				var span_6 = $.sibling($.child(div_29), 2);
				var text_10 = $.only_child(span_6, true);

				$.reset(div_29);
				$.reset(div_26);
				$.reset(div_22);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_5, DS_DIGEST_TYPES[$.get(ds).digestType]);
						$.set_text(text_6, `Key Tag: ${$.get(ds).keyTag ?? ''}`);
						classes_4 = $.set_class(button_3, 1, 'copy-btn small svelte-t5ue2i', null, classes_4, { copied: $0 });
						$.set_text(text_7, $1);
						$.set_text(text_8, `${$.get(ds).algorithm ?? ''} (${(DNSSEC_ALGORITHMS[$.get(ds).algorithm] || 'Unknown') ?? ''})`);
						$.set_text(text_9, `${$.get(ds).digestType ?? ''} (${DS_DIGEST_TYPES[$.get(ds).digestType] ?? ''})`);
						$.set_text(text_10, $.get(ds).digest);
					},
					[
						() => clipboard.isCopied(`ds-${$.get(ds).keyTag}-${$.get(ds).digestType}`),
						() => formatDSRecord($.get(ds), $.get(ownerName))
					]
				);

				$.delegated('click', button_3, () => copyDS($.get(ds)));
				$.append($$anchor, div_22);
			});

			$.reset(div_21);
			$.reset(div_18);
			$.reset(div_17);
			$.template_effect(($0) => classes_3 = $.set_class(button_2, 1, 'copy-btn svelte-t5ue2i', null, classes_3, { copied: $0 }), [() => clipboard.isCopied('all')]);
			$.delegated('click', button_2, copyAllDS);
			$.append($$anchor, div_17);
		};

		$.if(node_10, ($$render) => {
			if ($.get(dsRecords).length > 0) $$render(consequent_3);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		classes_2 = $.set_class(button_1, 1, 'generate-btn svelte-t5ue2i', null, classes_2, { loading: $.get(generatingDS) });
		button_1.disabled = !$.get(isValid) || $.get(generatingDS);
	});

	$.delegated('input', input, handleInput);
	$.bind_value(input, () => $.get(ownerName), ($$value) => $.set(ownerName, $$value));
	$.delegated('input', textarea, handleInput);
	$.bind_value(textarea, () => $.get(dnskeyInput), ($$value) => $.set(dnskeyInput, $$value));
	$.delegated('click', button_1, generateDS);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);