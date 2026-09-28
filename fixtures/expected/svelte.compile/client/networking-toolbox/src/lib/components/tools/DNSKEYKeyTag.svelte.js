import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

import {
	parseDNSKEYRecord,
	calculateKeyTag,
	validateDNSKEY,
	DNSSEC_ALGORITHMS
} from '$lib/utils/dnssec';

import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-title svelte-fm58b9"> </div> <div class="example-dnskey svelte-fm58b9"> </div> <div class="example-description svelte-fm58b9"> </div></button>`);
var root_1 = $.from_html(`<p class="field-help svelte-fm58b9">Using example data - modify to see your results</p>`);
var root_2 = $.from_html(`<div class="card error-card svelte-fm58b9"><div class="error-content svelte-fm58b9"><!> <div><strong class="svelte-fm58b9">Validation Error:</strong> </div></div></div>`);
var root_3 = $.from_html(`<div class="card results-card svelte-fm58b9"><div class="results-header svelte-fm58b9"><h3 class="svelte-fm58b9">Key Tag Calculation</h3> <button><!> Copy Key Tag</button></div> <div class="key-tag-display svelte-fm58b9"><div class="key-tag-label svelte-fm58b9">Key Tag</div> <div class="key-tag-value svelte-fm58b9"> </div></div> <div class="metadata-section svelte-fm58b9"><h4 class="svelte-fm58b9">DNSKEY Metadata</h4> <div class="metadata-grid svelte-fm58b9"><div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Key Type</span> <span> </span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Flags</span> <span class="metadata-value mono svelte-fm58b9"> </span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Protocol</span> <span class="metadata-value mono svelte-fm58b9"> </span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Algorithm</span> <span class="metadata-value mono svelte-fm58b9"> </span></div></div> <div class="public-key-section svelte-fm58b9"><h5 class="svelte-fm58b9">Public Key (Base64)</h5> <div class="public-key svelte-fm58b9"> </div></div></div></div>`);

var root_4 = $.from_html(`<div class="card"><header class="card-header"><h1>DNSKEY Key Tag Calculator</h1> <p>Compute the DNSKEY key tag from a DNSKEY RR (RFC 4034 algorithm) and display it alongside key metadata for DNSSEC
      validation purposes.</p></header> <div class="card examples-card svelte-fm58b9"><details class="examples-details svelte-fm58b9"><summary class="examples-summary svelte-fm58b9"><!> <h4 class="svelte-fm58b9">DNSKEY Examples</h4></summary> <div class="examples-grid svelte-fm58b9"></div></details></div> <div class="card input-card svelte-fm58b9"><div class="form-group svelte-fm58b9"><label for="dnskey-input" class="svelte-fm58b9"><!> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.org. 3600 IN DNSKEY 257 3 8 AwEAAc..." rows="4"></textarea> <!></div></div> <!> <div class="education-card svelte-fm58b9"><div class="education-grid svelte-fm58b9"><div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Key Tag Purpose</h4> <p class="svelte-fm58b9">The key tag is a short identifier used to quickly identify which DNSKEY was used to generate a signature. It's
          calculated using a checksum algorithm defined in RFC 4034 and helps optimize DNSSEC validation by avoiding the
          need to test every key.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Key Types</h4> <p class="svelte-fm58b9"><strong>KSK (Key Signing Key):</strong> Used to sign other keys (ZSKs). Has the SEP flag set (bit 15). <strong>ZSK (Zone Signing Key):</strong> Used to sign zone data. Does not have the SEP flag set.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Algorithm Support</h4> <p class="svelte-fm58b9">Supports all modern DNSSEC algorithms including RSASHA256 (8), RSASHA512 (10), ECDSA P-256 (13), ECDSA P-384
          (14), and Ed25519 (15). Legacy algorithms like RSAMD5 are deprecated and should not be used.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Validation Process</h4> <p class="svelte-fm58b9">The tool validates DNSKEY format, checks protocol compliance (must be 3), verifies algorithm support, and
          ensures proper base64 encoding of the public key before calculating the key tag.</p></div></div></div></div>`);

export default function DNSKEYKeyTag($$anchor, $$props) {
	$.push($$props, true);

	let dnskeyInput = $.state('example.org. 3600 IN DNSKEY 257 3 8 AwEAAag');
	let activeExampleIndex = $.state(null);
	let isActiveExample = $.state(true);
	const clipboard = useClipboard();

	const examples = [
		{
			title: 'KSK Example (Algorithm 8 - RSASHA256)',
			dnskey: 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			description: 'Key Signing Key with SEP flag set'
		},

		{
			title: 'ZSK Example (Algorithm 13 - ECDSAP256SHA256)',
			dnskey: 'example.org. 3600 IN DNSKEY 256 3 13 kC1gJ+0qtVgdl0VAO/6t9vRaB15v4PclEV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			description: 'Zone Signing Key for data signing'
		},

		{
			title: 'RDATA Only Format',
			dnskey: '257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
			description: 'DNSKEY record data without owner name'
		}
	];

	const result = $.derived(() => {
		if (!$.get(dnskeyInput).trim()) return null;

		const validation = validateDNSKEY($.get(dnskeyInput));

		if (!validation.valid) {
			return { error: validation.error };
		}

		const dnskey = parseDNSKEYRecord($.get(dnskeyInput));

		if (!dnskey) {
			return { error: 'Failed to parse DNSKEY record' };
		}

		const keyTag = calculateKeyTag(dnskey);

		return { dnskey: { ...dnskey, keyTag }, keyTag };
	});

	function loadExample(index) {
		$.set(dnskeyInput, examples[index].dnskey, true);
		$.set(activeExampleIndex, index, true);
		$.set(isActiveExample, false);
	}

	function handleInputChange() {
		if ($.get(isActiveExample) && $.get(dnskeyInput) !== 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...') {
			$.set(isActiveExample, false);
		}

		$.set(activeExampleIndex, null);
	}

	var div = root_4();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, index) => {
		var button = root();
		var div_3 = $.child(button);
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_1 = $.only_child(div_4, true);
		var div_5 = $.sibling(div_4, 2);
		var text_2 = $.only_child(div_5, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === index ? 'active' : ''}`, 'svelte-fm58b9');
			$.set_text(text, $.get(example).title);
			$.set_text(text_1, $.get(example).dnskey);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample(index));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.child(div_6);
	var label = $.child(div_7);
	var node_1 = $.child(label);

	Icon(node_1, { name: 'key', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Enter a DNSKEY record in standard format (e.g., 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAag') to calculate its key tag");

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);

	var node_2 = $.sibling(textarea, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isActiveExample)) $$render(consequent);
		});
	}

	$.reset(div_7);
	$.reset(div_6);

	var node_3 = $.sibling(div_6, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = $.comment();
			var node_4 = $.first_child(fragment);

			{
				var consequent_1 = ($$anchor) => {
					var div_8 = root_2();
					var div_9 = $.child(div_8);
					var node_5 = $.child(div_9);

					Icon(node_5, { name: 'alert-triangle', size: 'sm' });

					var div_10 = $.sibling(node_5, 2);
					var text_3 = $.sibling($.child(div_10));

					$.reset(div_10);
					$.reset(div_9);
					$.reset(div_8);
					$.template_effect(() => $.set_text(text_3, ` ${$.get(result).error ?? ''}`));
					$.append($$anchor, div_8);
				};

				var consequent_2 = ($$anchor) => {
					var div_11 = root_3();
					var div_12 = $.child(div_11);
					var button_1 = $.sibling($.child(div_12), 2);
					var node_6 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

						Icon(node_6, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button_1);
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var div_14 = $.child(div_13);

					$.action(div_14, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'A 16-bit identifier calculated from the DNSKEY used to quickly identify which key was used to generate a signature');

					var div_15 = $.sibling(div_14, 2);
					var text_4 = $.only_child(div_15, true);

					$.reset(div_13);

					var div_16 = $.sibling(div_13, 2);
					var div_17 = $.sibling($.child(div_16), 2);
					var div_18 = $.child(div_17);
					var span = $.child(div_18);

					$.action(span, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'KSK (Key Signing Key) signs other keys and has the SEP flag set (257). ZSK (Zone Signing Key) signs zone data and has no SEP flag (256).');

					var span_1 = $.sibling(span, 2);
					var text_5 = $.only_child(span_1, true);

					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var span_2 = $.child(div_19);

					$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => '16-bit flags field. Bit 15 (SEP flag) indicates if this is a Key Signing Key. 257 = KSK, 256 = ZSK.');

					var span_3 = $.sibling(span_2, 2);
					var text_6 = $.only_child(span_3, true);

					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var span_4 = $.child(div_20);

					$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Protocol field for DNSKEY records. Must always be 3 (DNSSEC).');

					var span_5 = $.sibling(span_4, 2);
					var text_7 = $.only_child(span_5, true);

					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var span_6 = $.child(div_21);

					$.action(span_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Cryptographic algorithm used by this key. Common values: 8 (RSASHA256), 13 (ECDSA P-256), 15 (Ed25519).');

					var span_7 = $.sibling(span_6, 2);
					var text_8 = $.only_child(span_7);

					$.reset(div_21);
					$.reset(div_17);

					var div_22 = $.sibling(div_17, 2);
					var h5 = $.child(div_22);

					$.action(h5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The actual cryptographic public key data encoded in Base64 format. This is used for signature verification.');

					var div_23 = $.sibling(h5, 2);
					var text_9 = $.only_child(div_23, true);

					$.reset(div_22);
					$.reset(div_16);
					$.reset(div_11);

					$.template_effect(
						($0, $1) => {
							$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-fm58b9');
							$.set_text(text_4, $.get(result).keyTag);
							$.set_class(span_1, 1, `metadata-value key-type-${$1 ?? ''}`, 'svelte-fm58b9');
							$.set_text(text_5, $.get(result).dnskey.keyType || 'Unknown');
							$.set_text(text_6, $.get(result).dnskey.flags);
							$.set_text(text_7, $.get(result).dnskey.protocol);
							$.set_text(text_8, `${$.get(result).dnskey.algorithm ?? ''} (${(DNSSEC_ALGORITHMS[$.get(result).dnskey.algorithm] || 'Unknown') ?? ''})`);
							$.set_text(text_9, $.get(result).dnskey.publicKey);
						},
						[
							() => clipboard.isCopied() ? 'copied' : '',
							() => $.get(result).dnskey.keyType?.toLowerCase()
						]
					);

					$.delegated('click', button_1, () => $.get(result) && !$.get(result).error && $.get(result).keyTag !== undefined && clipboard.copy($.get(result).keyTag.toString()));
					$.append($$anchor, div_11);
				};

				$.if(node_4, ($$render) => {
					if ($.get(result).error) $$render(consequent_1); else if ($.get(result).dnskey) $$render(consequent_2, 1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node_3, ($$render) => {
			if ($.get(result)) $$render(consequent_3);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_class(textarea, 1, `dnskey-input ${$.get(isActiveExample) ? 'example-active' : ''}`, 'svelte-fm58b9'));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(dnskeyInput), ($$value) => $.set(dnskeyInput, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);