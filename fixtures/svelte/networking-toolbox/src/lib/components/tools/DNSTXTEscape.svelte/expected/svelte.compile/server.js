import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

export default function DNSTXTEscape($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rawText = '';
		let maxChunkLength = 255;
		let escapeQuotes = true;
		let escapeBackslashes = true;
		let preserveSpaces = true;
		let showExamples = false;
		let selectedExample = null;

		const chunks = $.derived(() => {
			if (!rawText.trim()) return [];

			const text = rawText.trim();
			const chunkList = [];
			let remaining = text;

			while (remaining.length > 0) {
				let chunkSize = Math.min(remaining.length, maxChunkLength);
				let chunk = remaining.substring(0, chunkSize);

				// Escape the chunk
				let escaped = chunk;

				if (escapeBackslashes) {
					escaped = escaped.replace(/\\/g, '\\\\');
				}

				if (escapeQuotes) {
					escaped = escaped.replace(/"/g, '\\"');
				}

				if (!preserveSpaces) {
					escaped = escaped.replace(/\s+/g, ' ');
				}

				// If escaped version is too long, reduce chunk size
				while (escaped.length > maxChunkLength && chunkSize > 1) {
					chunkSize--;
					chunk = remaining.substring(0, chunkSize);
					escaped = chunk;

					if (escapeBackslashes) {
						escaped = escaped.replace(/\\/g, '\\\\');
					}

					if (escapeQuotes) {
						escaped = escaped.replace(/"/g, '\\"');
					}

					if (!preserveSpaces) {
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
			if (!rawText.trim()) {
				return {
					isValid: false,
					message: 'Please enter text to escape',
					type: 'error'
				};
			}

			if (maxChunkLength < 1 || maxChunkLength > 255) {
				return {
					isValid: false,
					message: 'Chunk length must be between 1 and 255 characters',
					type: 'error'
				};
			}

			const oversizedChunks = chunks().filter((chunk) => chunk.escapedLength > maxChunkLength);

			if (oversizedChunks.length > 0) {
				return {
					isValid: false,
					message: `${oversizedChunks.length} chunk(s) exceed the maximum length after escaping`,
					type: 'error'
				};
			}

			if (chunks().length > 10) {
				return {
					isValid: true,
					message: `Text split into ${chunks().length} chunks (consider splitting across multiple TXT records)`,
					type: 'warning'
				};
			}

			return {
				isValid: true,
				message: `Text successfully split into ${chunks().length} chunk(s)`,
				type: 'success'
			};
		});

		const totalLength = $.derived(() => chunks().reduce((sum, chunk) => sum + chunk.escapedLength, 0));
		const dnsRecord = $.derived(() => chunks().map((chunk) => `"${chunk.escaped}"`).join(' '));

		const zoneFileFormat = $.derived(() => () => {
			if (chunks().length === 0) return '';
			if (chunks().length === 1) return `example.com. IN TXT "${chunks()[0].escaped}"`;

			return `example.com. IN TXT (\n${chunks().map((chunk) => `    "${chunk.escaped}"`).join('\n')}\n)`;
		});

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text);
		}

		function exportAsZoneFile() {
			if (!zoneFileFormat()()) return;

			const blob = new Blob([zoneFileFormat()()], { type: 'text/plain' });
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
			rawText = text;
			selectedExample = text;
			showExamples = false;
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

		$$renderer.push(`<div class="card"><div class="card-header"><h1>TXT Record Escape Tool</h1> <p class="card-subtitle">Safely escape and split TXT record strings into DNS-compatible chunks (≤255 characters each).</p></div> <div class="grid-layout"><div class="input-section"><div class="text-input-config svelte-116tcdm"><div class="input-group"><label for="rawText">`);
		Icon($$renderer, { name: 'edit', size: 'sm' });
		$$renderer.push(`<!----> Text to Escape</label> <textarea id="rawText" placeholder="Enter your raw text here..." rows="6" class="svelte-116tcdm">`);

		const $$body = $.escape(rawText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="config-row svelte-116tcdm"><div class="input-group"><label for="maxChunkLength">`);
		Icon($$renderer, { name: 'ruler', size: 'sm' });
		$$renderer.push(`<!----> Max Chunk Length</label> <input id="maxChunkLength" type="number"${$.attr('value', maxChunkLength)} min="1" max="255" class="svelte-116tcdm"/></div> <div class="escape-options svelte-116tcdm"><h4 class="svelte-116tcdm">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> Escape Options</h4> <div class="checkbox-group svelte-116tcdm"><label class="checkbox-label svelte-116tcdm"><input type="checkbox"${$.attr('checked', escapeQuotes, true)} class="svelte-116tcdm"/> <span class="svelte-116tcdm">Escape Quotes (")</span> <span class="svelte-116tcdm">`);
		Icon($$renderer, { name: 'help', size: 'sm' });
		$$renderer.push(`<!----></span></label> <label class="checkbox-label svelte-116tcdm"><input type="checkbox"${$.attr('checked', escapeBackslashes, true)} class="svelte-116tcdm"/> <span class="svelte-116tcdm">Escape Backslashes (\\\\)</span> <span class="svelte-116tcdm">`);
		Icon($$renderer, { name: 'help', size: 'sm' });
		$$renderer.push(`<!----></span></label> <label class="checkbox-label svelte-116tcdm"><input type="checkbox"${$.attr('checked', preserveSpaces, true)} class="svelte-116tcdm"/> <span class="svelte-116tcdm">Preserve Spacing</span> <span class="svelte-116tcdm">`);
		Icon($$renderer, { name: 'help', size: 'sm' });
		$$renderer.push(`<!----></span></label></div></div></div></div> <div class="validation-section svelte-116tcdm"><div${$.attr_class(`validation-status ${$.stringify(validation().type)}`, 'svelte-116tcdm')}>`);

		Icon($$renderer, {
			name: validation().type === 'error'
				? 'error'
				: validation().type === 'warning' ? 'warning' : 'check-circle',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(validation().message)}</div></div></div> <div class="results-section">`);

		if (chunks().length > 0) {
			$$renderer.push(`<!--[0--><div class="chunks-section svelte-116tcdm"><div class="section-header svelte-116tcdm"><h3 class="svelte-116tcdm">Escaped Chunks (${$.escape(chunks().length)})</h3> <div class="stats svelte-116tcdm"><span class="stat svelte-116tcdm">${$.escape(totalLength())} chars</span></div></div> <div class="chunks-list svelte-116tcdm"><!--[-->`);

			const each_array = $.ensure_array_like(chunks());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let chunk = each_array[index];

				$$renderer.push(`<div class="chunk-item svelte-116tcdm"><div class="chunk-header svelte-116tcdm"><span class="chunk-number svelte-116tcdm">Chunk ${$.escape(index + 1)}</span> <span class="chunk-length svelte-116tcdm">${$.escape(chunk.escapedLength)}/${$.escape(maxChunkLength)}</span></div> <div class="chunk-content svelte-116tcdm"><code class="svelte-116tcdm">"${$.escape(chunk.escaped)}"</code> <button type="button" class="copy-btn svelte-116tcdm">`);
				Icon($$renderer, { name: 'copy', size: 'sm' });
				$$renderer.push(`<!----></button></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="output-section svelte-116tcdm"><div class="section-header svelte-116tcdm"><h3 class="svelte-116tcdm">DNS Record Format</h3> <div class="actions svelte-116tcdm"><button type="button" class="copy-btn svelte-116tcdm">`);
			Icon($$renderer, { name: 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy</button> <button type="button" class="export-btn svelte-116tcdm">`);
			Icon($$renderer, { name: 'download', size: 'sm' });
			$$renderer.push(`<!----> Export</button></div></div> <div class="output-formats svelte-116tcdm"><div class="format-section svelte-116tcdm"><h4 class="svelte-116tcdm">Single Line Format:</h4> <div class="code-block svelte-116tcdm"><code class="svelte-116tcdm">${$.escape(dnsRecord())}</code></div></div> <div class="format-section svelte-116tcdm"><h4 class="svelte-116tcdm">Zone File Format:</h4> <div class="code-block svelte-116tcdm"><pre class="svelte-116tcdm"><code class="svelte-116tcdm">${$.escape(zoneFileFormat()())}</code></pre></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="examples-section svelte-116tcdm"><details class="examples-toggle svelte-116tcdm"${$.attr('open', showExamples, true)}><summary class="svelte-116tcdm">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Texts</summary> <div class="examples-grid svelte-116tcdm"><!--[-->`);

		const each_array_1 = $.ensure_array_like(exampleTexts);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let example = each_array_1[$$index_1];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-116tcdm', void 0, { 'selected': selectedExample === example.value })}><div class="example-header svelte-116tcdm"><strong class="svelte-116tcdm">${$.escape(example.name)}</strong></div> <p class="example-description svelte-116tcdm">${$.escape(example.description)}</p> <div class="example-preview svelte-116tcdm">${$.escape(example.value.substring(0, 80))}${$.escape(example.value.length > 80 ? '...' : '')}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}