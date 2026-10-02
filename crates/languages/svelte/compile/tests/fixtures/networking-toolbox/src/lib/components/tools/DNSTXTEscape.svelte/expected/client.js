import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<div class="chunk-item svelte-116tcdm"><div class="chunk-header svelte-116tcdm"><span class="chunk-number svelte-116tcdm"></span> <span class="chunk-length svelte-116tcdm"> </span></div> <div class="chunk-content svelte-116tcdm"><code class="svelte-116tcdm"> </code> <button type="button" class="copy-btn svelte-116tcdm"><!></button></div></div>`);
var root_1 = $.from_html(`<div class="chunks-section svelte-116tcdm"><div class="section-header svelte-116tcdm"><h3 class="svelte-116tcdm"> </h3> <div class="stats svelte-116tcdm"><span class="stat svelte-116tcdm"> </span></div></div> <div class="chunks-list svelte-116tcdm"></div></div> <div class="output-section svelte-116tcdm"><div class="section-header svelte-116tcdm"><h3 class="svelte-116tcdm">DNS Record Format</h3> <div class="actions svelte-116tcdm"><button type="button" class="copy-btn svelte-116tcdm"><!> Copy</button> <button type="button" class="export-btn svelte-116tcdm"><!> Export</button></div></div> <div class="output-formats svelte-116tcdm"><div class="format-section svelte-116tcdm"><h4 class="svelte-116tcdm">Single Line Format:</h4> <div class="code-block svelte-116tcdm"><code class="svelte-116tcdm"> </code></div></div> <div class="format-section svelte-116tcdm"><h4 class="svelte-116tcdm">Zone File Format:</h4> <div class="code-block svelte-116tcdm"><pre class="svelte-116tcdm"><code class="svelte-116tcdm"> </code></pre></div></div></div></div>`, 1);
var root_2 = $.from_html(`<button type="button"><div class="example-header svelte-116tcdm"><strong class="svelte-116tcdm"> </strong></div> <p class="example-description svelte-116tcdm"> </p> <div class="example-preview svelte-116tcdm"> </div></button>`);
var root_3 = $.from_html(`<div class="card"><div class="card-header"><h1>TXT Record Escape Tool</h1> <p class="card-subtitle">Safely escape and split TXT record strings into DNS-compatible chunks (≤255 characters each).</p></div> <div class="grid-layout"><div class="input-section"><div class="text-input-config svelte-116tcdm"><div class="input-group"><label for="rawText"><!> Text to Escape</label> <textarea id="rawText" placeholder="Enter your raw text here..." rows="6" class="svelte-116tcdm"></textarea></div> <div class="config-row svelte-116tcdm"><div class="input-group"><label for="maxChunkLength"><!> Max Chunk Length</label> <input id="maxChunkLength" type="number" min="1" max="255" class="svelte-116tcdm"/></div> <div class="escape-options svelte-116tcdm"><h4 class="svelte-116tcdm"><!> Escape Options</h4> <div class="checkbox-group svelte-116tcdm"><label class="checkbox-label svelte-116tcdm"><input type="checkbox" class="svelte-116tcdm"/> <span class="svelte-116tcdm">Escape Quotes (")</span> <span class="svelte-116tcdm"><!></span></label> <label class="checkbox-label svelte-116tcdm"><input type="checkbox" class="svelte-116tcdm"/> <span class="svelte-116tcdm">Escape Backslashes (\\\\)</span> <span class="svelte-116tcdm"><!></span></label> <label class="checkbox-label svelte-116tcdm"><input type="checkbox" class="svelte-116tcdm"/> <span class="svelte-116tcdm">Preserve Spacing</span> <span class="svelte-116tcdm"><!></span></label></div></div></div></div> <div class="validation-section svelte-116tcdm"><div><!> </div></div></div> <div class="results-section"><!></div></div> <div class="examples-section svelte-116tcdm"><details class="examples-toggle svelte-116tcdm"><summary class="svelte-116tcdm"><!> Example Texts</summary> <div class="examples-grid svelte-116tcdm"></div></details></div></div>`);

export default function DNSTXTEscape($$anchor, $$props) {
	$.push($$props, true);

	let rawText = $.state('');
	let maxChunkLength = $.state(255);
	let escapeQuotes = $.state(true);
	let escapeBackslashes = $.state(true);
	let preserveSpaces = $.state(true);
	let showExamples = $.state(false);
	let selectedExample = $.state(null);

	const chunks = $.derived(() => {
		if (!$.get(rawText).trim()) return [];

		const text = $.get(rawText).trim();
		const chunkList = [];
		let remaining = text;

		while (remaining.length > 0) {
			let chunkSize = Math.min(remaining.length, $.get(maxChunkLength));
			let chunk = remaining.substring(0, chunkSize);

			// Escape the chunk
			let escaped = chunk;

			if ($.get(escapeBackslashes)) {
				escaped = escaped.replace(/\\/g, '\\\\');
			}

			if ($.get(escapeQuotes)) {
				escaped = escaped.replace(/"/g, '\\"');
			}

			if (!$.get(preserveSpaces)) {
				escaped = escaped.replace(/\s+/g, ' ');
			}

			// If escaped version is too long, reduce chunk size
			while (escaped.length > $.get(maxChunkLength) && chunkSize > 1) {
				chunkSize--;
				chunk = remaining.substring(0, chunkSize);
				escaped = chunk;

				if ($.get(escapeBackslashes)) {
					escaped = escaped.replace(/\\/g, '\\\\');
				}

				if ($.get(escapeQuotes)) {
					escaped = escaped.replace(/"/g, '\\"');
				}

				if (!$.get(preserveSpaces)) {
					escaped = escaped.replace(/\s+/g, ' ');
				}
			}

			chunkList.push({
				chunk,
				length: chunk.length,
				escaped,
				escapedLength: escaped.length
			});

			remaining = remaining.substring(chunkSize);
		}

		return chunkList;
	});

	const validation = $.derived(() => {
		if (!$.get(rawText).trim()) {
			return {
				isValid: false,
				message: 'Please enter text to escape',
				type: 'error'
			};
		}

		if ($.get(maxChunkLength) < 1 || $.get(maxChunkLength) > 255) {
			return {
				isValid: false,
				message: 'Chunk length must be between 1 and 255 characters',
				type: 'error'
			};
		}

		const oversizedChunks = $.get(chunks).filter((chunk) => chunk.escapedLength > $.get(maxChunkLength));

		if (oversizedChunks.length > 0) {
			return {
				isValid: false,
				message: `${oversizedChunks.length} chunk(s) exceed the maximum length after escaping`,
				type: 'error'
			};
		}

		if ($.get(chunks).length > 10) {
			return {
				isValid: true,
				message: `Text split into ${$.get(chunks).length} chunks (consider splitting across multiple TXT records)`,
				type: 'warning'
			};
		}

		return {
			isValid: true,
			message: `Text successfully split into ${$.get(chunks).length} chunk(s)`,
			type: 'success'
		};
	});

	const totalLength = $.derived(() => $.get(chunks).reduce((sum, chunk) => sum + chunk.escapedLength, 0));
	const dnsRecord = $.derived(() => $.get(chunks).map((chunk) => `"${chunk.escaped}"`).join(' '));

	const zoneFileFormat = $.derived(() => () => {
		if ($.get(chunks).length === 0) return '';
		if ($.get(chunks).length === 1) return `example.com. IN TXT "${$.get(chunks)[0].escaped}"`;

		return `example.com. IN TXT (\n${$.get(chunks).map((chunk) => `    "${chunk.escaped}"`).join('\n')}\n)`;
	});

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	function exportAsZoneFile() {
		if (!$.get(zoneFileFormat)()) return;

		const blob = new Blob([$.get(zoneFileFormat)()], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = 'txt-record.zone';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function loadExample(text) {
		$.set(rawText, text, true);
		$.set(selectedExample, text, true);
		$.set(showExamples, false);
	}

	const exampleTexts = [
		{
			name: 'SPF Record',
			description: 'Sender Policy Framework record for email authentication',
			value: 'v=spf1 include:_spf.google.com include:mailgun.org include:servers.mcsv.net ~all'
		},

		{
			name: 'DKIM Key',
			description: 'DomainKeys Identified Mail public key record',
			value: 'k=rsa; t=s; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6+nQKQ5R7fPqqJLmPjGYGqwVF6'
		},

		{
			name: 'Domain Verification',
			description: 'Google domain ownership verification token',
			value: 'google-site-verification=rXOxyZounnZasA8Z7oaD3c14JdjS9aKSWvsR1EbUSIQ'
		},

		{
			name: 'Long Text Sample',
			description: 'Text that will need to be split into multiple chunks',
			value: 'This is a very long text string that will definitely exceed the 255 character limit for DNS TXT records and will need to be properly escaped and split into multiple chunks. The escaping tool should handle this automatically and show you exactly how many chunks are created and what the final DNS record format will look like when you publish it to your DNS provider.'
		}
	];

	var div = root_3();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var node = $.child(label);

	Icon(node, { name: 'edit', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The original text that will be escaped and split into chunks');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var label_1 = $.child(div_6);
	var node_1 = $.child(label_1);

	Icon(node_1, { name: 'ruler', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Maximum length for each chunk (DNS TXT record limit is 255 characters)');

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var h4 = $.child(div_7);
	var node_2 = $.child(h4);

	Icon(node_2, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h4);
	$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Configure how the text should be escaped for DNS compatibility');

	var div_8 = $.sibling(h4, 2);
	var label_2 = $.child(div_8);
	var input_1 = $.child(label_2);

	$.remove_input_defaults(input_1);

	var span = $.sibling(input_1, 4);
	var node_3 = $.child(span);

	Icon(node_3, { name: 'help', size: 'sm' });
	$.reset(span);
	$.action(span, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Escape double quote characters as \\"');
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_2 = $.child(label_3);

	$.remove_input_defaults(input_2);

	var span_1 = $.sibling(input_2, 4);
	var node_4 = $.child(span_1);

	Icon(node_4, { name: 'help', size: 'sm' });
	$.reset(span_1);
	$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Escape backslash characters as \\\\');
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_3 = $.child(label_4);

	$.remove_input_defaults(input_3);

	var span_2 = $.sibling(input_3, 4);
	var node_5 = $.child(span_2);

	Icon(node_5, { name: 'help', size: 'sm' });
	$.reset(span_2);
	$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Keep original whitespace formatting instead of normalizing spaces');
	$.reset(label_4);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_3);

	var div_9 = $.sibling(div_3, 2);
	var div_10 = $.child(div_9);
	var node_6 = $.child(div_10);

	{
		let $0 = $.derived(() => $.get(validation).type === 'error'
			? 'error'
			: $.get(validation).type === 'warning' ? 'warning' : 'check-circle');

		Icon(node_6, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_1 = $.sibling(node_6);

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_2);

	var div_11 = $.sibling(div_2, 2);
	var node_7 = $.child(div_11);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var div_12 = $.first_child(fragment);
			var div_13 = $.child(div_12);
			var h3 = $.child(div_13);
			var text_2 = $.only_child(h3);
			var div_14 = $.sibling(h3, 2);
			var span_3 = $.child(div_14);
			var text_3 = $.only_child(span_3);

			$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total length after escaping');
			$.reset(div_14);
			$.reset(div_13);

			var div_15 = $.sibling(div_13, 2);

			$.each(div_15, 21, () => $.get(chunks), $.index, ($$anchor, chunk, index) => {
				var div_16 = root();
				var div_17 = $.child(div_16);
				var span_4 = $.child(div_17);

				span_4.textContent = `Chunk ${index + 1}`;

				var span_5 = $.sibling(span_4, 2);
				var text_4 = $.only_child(span_5);

				$.reset(div_17);

				var div_18 = $.sibling(div_17, 2);
				var code = $.child(div_18);
				var text_5 = $.only_child(code);
				var button = $.sibling(code, 2);
				var node_8 = $.child(button);

				Icon(node_8, { name: 'copy', size: 'sm' });
				$.reset(button);
				$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy this chunk to clipboard');
				$.reset(div_18);
				$.reset(div_16);

				$.template_effect(() => {
					$.set_text(text_4, `${$.get(chunk).escapedLength ?? ''}/${$.get(maxChunkLength) ?? ''}`);
					$.set_text(text_5, `"${$.get(chunk).escaped ?? ''}"`);
				});

				$.delegated('click', button, () => copyToClipboard(`"${$.get(chunk).escaped}"`));
				$.append($$anchor, div_16);
			});

			$.reset(div_15);
			$.reset(div_12);

			var div_19 = $.sibling(div_12, 2);
			var div_20 = $.child(div_19);
			var div_21 = $.sibling($.child(div_20), 2);
			var button_1 = $.child(div_21);
			var node_9 = $.child(button_1);

			Icon(node_9, { name: 'copy', size: 'sm' });
			$.next();
			$.reset(button_1);
			$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy single-line DNS record format');

			var button_2 = $.sibling(button_1, 2);
			var node_10 = $.child(button_2);

			Icon(node_10, { name: 'download', size: 'sm' });
			$.next();
			$.reset(button_2);
			$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
			$.reset(div_21);
			$.reset(div_20);

			var div_22 = $.sibling(div_20, 2);
			var div_23 = $.child(div_22);
			var div_24 = $.sibling($.child(div_23), 2);
			var code_1 = $.child(div_24);
			var text_6 = $.only_child(code_1, true);

			$.reset(div_24);
			$.reset(div_23);

			var div_25 = $.sibling(div_23, 2);
			var div_26 = $.sibling($.child(div_25), 2);
			var pre = $.child(div_26);
			var code_2 = $.child(pre);
			var text_7 = $.only_child(code_2, true);

			$.reset(pre);
			$.reset(div_26);
			$.reset(div_25);
			$.reset(div_22);
			$.reset(div_19);

			$.template_effect(
				($0) => {
					$.set_text(text_2, `Escaped Chunks (${$.get(chunks).length ?? ''})`);
					$.set_text(text_3, `${$.get(totalLength) ?? ''} chars`);
					$.set_text(text_6, $.get(dnsRecord));
					$.set_text(text_7, $0);
				},
				[() => $.get(zoneFileFormat)()]
			);

			$.delegated('click', button_1, () => copyToClipboard($.get(dnsRecord)));
			$.delegated('click', button_2, exportAsZoneFile);
			$.append($$anchor, fragment);
		};

		$.if(node_7, ($$render) => {
			if ($.get(chunks).length > 0) $$render(consequent);
		});
	}

	$.reset(div_11);
	$.reset(div_1);

	var div_27 = $.sibling(div_1, 2);
	var details = $.child(div_27);
	var summary = $.child(details);
	var node_11 = $.child(summary);

	Icon(node_11, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_28 = $.sibling(summary, 2);

	$.each(div_28, 21, () => exampleTexts, (example) => example.name, ($$anchor, example) => {
		var button_3 = root_2();
		let classes;
		var div_29 = $.child(button_3);
		var strong = $.child(div_29);
		var text_8 = $.only_child(strong, true);

		$.reset(div_29);

		var p = $.sibling(div_29, 2);
		var text_9 = $.only_child(p, true);
		var div_30 = $.sibling(p, 2);
		var text_10 = $.only_child(div_30);

		$.reset(button_3);

		$.template_effect(
			($0) => {
				classes = $.set_class(button_3, 1, 'example-card svelte-116tcdm', null, classes, { selected: $.get(selectedExample) === $.get(example).value });
				$.set_text(text_8, $.get(example).name);
				$.set_text(text_9, $.get(example).description);
				$.set_text(text_10, `${$0 ?? ''}${$.get(example).value.length > 80 ? '...' : ''}`);
			},
			[() => $.get(example).value.substring(0, 80)]
		);

		$.delegated('click', button_3, () => loadExample($.get(example).value));
		$.append($$anchor, button_3);
	});

	$.reset(div_28);
	$.reset(details);
	$.reset(div_27);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_10, 1, `validation-status ${$.get(validation).type ?? ''}`, 'svelte-116tcdm');
		$.set_text(text_1, ` ${$.get(validation).message ?? ''}`);
	});

	$.bind_value(textarea, () => $.get(rawText), ($$value) => $.set(rawText, $$value));
	$.bind_value(input, () => $.get(maxChunkLength), ($$value) => $.set(maxChunkLength, $$value));
	$.bind_checked(input_1, () => $.get(escapeQuotes), ($$value) => $.set(escapeQuotes, $$value));
	$.bind_checked(input_2, () => $.get(escapeBackslashes), ($$value) => $.set(escapeBackslashes, $$value));
	$.bind_checked(input_3, () => $.get(preserveSpaces), ($$value) => $.set(preserveSpaces, $$value));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);