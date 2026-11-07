import * as $ from 'svelte/internal/server';
import { generateULAAddresses, parseULA } from '$lib/utils/ula';

export default function ULAGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 1;
		let subnetIds = '';
		let result = null;
		let loading = false;
		let parseInput = '';
		let parseResult = null;

		async function generateULAs() {
			if (count < 1 || count > 100) return;

			loading = true;

			try {
				// Parse subnet IDs if provided
				const subnetIdArray = subnetIds.split(/[,\n]/).map((s) => s.trim()).filter((s) => s.length > 0);

				result = generateULAAddresses(count, subnetIdArray.length > 0 ? subnetIdArray : undefined);
			} finally {
				loading = false;
			}
		}

		function parseULAAddress() {
			if (!parseInput.trim()) {
				parseResult = null;

				return;
			}

			parseResult = parseULA(parseInput.trim());
		}

		function copyToClipboard(text) {
			navigator.clipboard?.writeText(text);
		}

		$$renderer.push(`<div class="container svelte-1vyxf2j"><div class="card svelte-1vyxf2j"><h2 class="svelte-1vyxf2j">ULA Generator</h2> <p class="svelte-1vyxf2j">Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs.</p> <div class="input-section svelte-1vyxf2j"><div class="input-group svelte-1vyxf2j"><label for="count" class="svelte-1vyxf2j">Number of ULAs to generate (1-100):</label> <input id="count" type="number" min="1" max="100"${$.attr('value', count)} placeholder="1" class="svelte-1vyxf2j"/></div> <div class="input-group svelte-1vyxf2j"><label for="subnet-ids" class="svelte-1vyxf2j">Subnet IDs (optional, comma/newline separated):</label> <textarea id="subnet-ids" rows="3" placeholder="0001, 0002, 0003 or leave empty for random generation" class="svelte-1vyxf2j">`);

		const $$body = $.escape(subnetIds);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <small class="svelte-1vyxf2j">If provided, must be 1-4 hex digits. Leave empty for random generation.</small></div> <button${$.attr('disabled', loading || count < 1 || count > 100, true)} class="generate-btn svelte-1vyxf2j">${$.escape(loading ? 'Generating...' : 'Generate ULA Addresses')}</button></div> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results-section svelte-1vyxf2j"><div class="summary svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">Generation Summary</h3> <div class="summary-stats svelte-1vyxf2j"><div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Total Requested:</span> <span class="value svelte-1vyxf2j">${$.escape(result.summary.totalRequests)}</span></div> <div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Successfully Generated:</span> <span class="value success svelte-1vyxf2j">${$.escape(result.summary.successfulGenerations)}</span></div> `);

			if (result.summary.failedGenerations > 0) {
				$$renderer.push(`<!--[0--><div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Failed:</span> <span class="value error svelte-1vyxf2j">${$.escape(result.summary.failedGenerations)}</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-1vyxf2j"><h4 class="svelte-1vyxf2j">Errors</h4> <ul class="svelte-1vyxf2j"><!--[-->`);

				const each_array = $.ensure_array_like(result.errors);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let error = each_array[index];

					$$renderer.push(`<li class="error svelte-1vyxf2j">${$.escape(error)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.generations.some((g) => g.isValid)) {
				$$renderer.push(`<!--[0--><div class="generations svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">Generated ULA Addresses</h3> <!--[-->`);

				const each_array_1 = $.ensure_array_like(result.generations);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let generation = each_array_1[i];

					if (generation.isValid) {
						$$renderer.push(`<!--[0--><div class="generation-result svelte-1vyxf2j"><div class="generation-header svelte-1vyxf2j"><h4 class="svelte-1vyxf2j">ULA #${$.escape(i + 1)}</h4> <button class="copy-btn svelte-1vyxf2j" title="Copy network address">📋</button></div> <div class="address-info svelte-1vyxf2j"><div class="address-row svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Network:</span> <code class="network svelte-1vyxf2j">${$.escape(generation.network)}</code></div> <div class="address-row svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Prefix:</span> <code class="svelte-1vyxf2j">${$.escape(generation.fullPrefix)}::/64</code></div></div> <div class="components svelte-1vyxf2j"><h5 class="svelte-1vyxf2j">Address Components</h5> <div class="component-grid svelte-1vyxf2j"><div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">ULA Prefix:</span> <code class="svelte-1vyxf2j">${$.escape(generation.prefix)}</code> <small class="svelte-1vyxf2j">${$.escape(generation.details.prefixBinary)}</small></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Global ID:</span> <code class="svelte-1vyxf2j">${$.escape(generation.globalID)}</code> <small class="svelte-1vyxf2j">${$.escape(generation.details.globalIDBinary)}</small></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Subnet ID:</span> <code class="svelte-1vyxf2j">${$.escape(generation.subnetID)}</code> <small class="svelte-1vyxf2j">${$.escape(generation.details.subnetIDBinary)}</small></div></div></div> <div class="generation-details svelte-1vyxf2j"><h5 class="svelte-1vyxf2j">Generation Details</h5> <div class="detail-grid svelte-1vyxf2j"><div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Algorithm:</span> <span class="svelte-1vyxf2j">${$.escape(generation.details.algorithm)}</span></div> <div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Timestamp:</span> <span class="svelte-1vyxf2j">${$.escape(new Date(generation.details.timestamp).toISOString())}</span></div> <div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Entropy:</span> <code>${$.escape(generation.details.entropy)}</code></div></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="generation-result error-result svelte-1vyxf2j"><h4>ULA #${$.escape(i + 1)} - Error</h4> <p class="error svelte-1vyxf2j">${$.escape(generation.error)}</p></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="card svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">ULA Address Parser</h3> <p class="svelte-1vyxf2j">Parse and analyze existing ULA addresses to extract their components.</p> <div class="input-group svelte-1vyxf2j"><label for="parse-input" class="svelte-1vyxf2j">ULA Address:</label> <input id="parse-input" type="text"${$.attr('value', parseInput)} placeholder="fd12:3456:789a:0001::/64" class="svelte-1vyxf2j"/></div> `);

		if (parseResult) {
			$$renderer.push('<!--[0-->');

			if (parseResult.isValid) {
				$$renderer.push(`<!--[0--><div class="parse-results svelte-1vyxf2j"><h4 class="svelte-1vyxf2j">Parsed Components</h4> <div class="component-grid svelte-1vyxf2j"><div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">ULA Prefix:</span> <code class="svelte-1vyxf2j">${$.escape(parseResult.prefix)}</code></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Global ID:</span> <code class="svelte-1vyxf2j">${$.escape(parseResult.globalID)}</code></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Subnet ID:</span> <code class="svelte-1vyxf2j">${$.escape(parseResult.subnetID)}</code></div> `);

				if (parseResult.interfaceID) {
					$$renderer.push(`<!--[0--><div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Interface ID:</span> <code class="svelte-1vyxf2j">${$.escape(parseResult.interfaceID)}</code></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-message svelte-1vyxf2j"><p class="error svelte-1vyxf2j">${$.escape(parseResult.error)}</p></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}