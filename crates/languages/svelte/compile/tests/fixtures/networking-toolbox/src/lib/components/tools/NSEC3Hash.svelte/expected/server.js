import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { calculateNSEC3Hash, NSEC3_HASH_ALGORITHMS } from '$lib/utils/dnssec';
import { useClipboard } from '$lib/composables';

export default function NSEC3Hash($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domainName = 'www.example.com.';
		let salt = '';
		let iterations = 10;
		let algorithm = 1;
		let activeExampleIndex = null;
		let isActiveExample = true;
		const clipboard = useClipboard();

		const examples = [
			{
				title: 'Standard Configuration',
				name: 'www.example.com.',
				salt: 'AABBCCDD',
				iterations: 10,
				algorithm: 1,
				description: 'Typical NSEC3 setup with moderate iterations'
			},

			{
				title: 'High Iteration Count',
				name: 'secure.example.org.',
				salt: '1234567890ABCDEF',
				iterations: 100,
				algorithm: 1,
				description: 'High security configuration with more iterations'
			},

			{
				title: 'No Salt (Empty)',
				name: 'blog.example.net.',
				salt: '',
				iterations: 5,
				algorithm: 1,
				description: 'Minimal configuration without salt'
			},

			{
				title: 'Subdomain Example',
				name: 'mail.internal.example.com.',
				salt: 'DEADBEEF',
				iterations: 50,
				algorithm: 1,
				description: 'Complex domain name with standard settings'
			}
		];

		let calculating = false;
		let result = null;
		let error = null;

		async function calculateHash() {
			error = null;
			result = null;
			calculating = true;

			try {
				if (!domainName.trim()) {
					error = 'Domain name is required';

					return;
				}

				if (iterations < 0 || iterations > 2500) {
					error = 'Iterations must be between 0 and 2500';

					return;
				}

				if (salt && !(/^[0-9A-Fa-f]*$/).test(salt)) {
					error = 'Salt must be hexadecimal (0-9, A-F) or empty';

					return;
				}

				const normalizedName = domainName.trim().toLowerCase();
				const normalizedSalt = salt.toUpperCase();
				const hash = await calculateNSEC3Hash(normalizedName, normalizedSalt, iterations, algorithm);

				if (!hash) {
					error = 'Failed to calculate NSEC3 hash';

					return;
				}

				result = { hash, originalName: normalizedName };
			} catch(err) {
				error = err instanceof Error ? err.message : 'Failed to calculate hash';
			} finally {
				calculating = false;
			}
		}

		const isValid = $.derived(() => () => {
			return domainName.trim() && iterations >= 0 && iterations <= 2500 && (salt === '' || (/^[0-9A-Fa-f]*$/).test(salt));
		});

		// Auto-calculate on mount with default values
		function loadExample(index) {
			const example = examples[index];

			domainName = example.name;
			salt = example.salt;
			iterations = example.iterations;
			algorithm = example.algorithm;
			activeExampleIndex = index;
			isActiveExample = false;

			// Auto-calculate after loading example
			if (isValid()()) {
				calculateHash();
			}
		}

		function handleInputChange() {
			if (isActiveExample && domainName !== 'www.example.com.') {
				isActiveExample = false;
			}

			activeExampleIndex = null;
			error = null;
			result = null;

			// Auto-calculate if inputs are valid
			if (isValid()()) {
				calculateHash();
			}
		}

		function copyHash() {
			if (result?.hash) {
				clipboard.copy(result.hash, 'hash');
			}
		}

		function copyNSEC3Record() {
			if (result?.hash && result?.originalName) {
				const record = `${result.hash}.example.com. IN NSEC3 1 0 ${iterations} ${salt || '-'} ${result.hash} A RRSIG`;

				clipboard.copy(record, 'record');
			}
		}

		function generateRandomSalt() {
			const chars = '0123456789ABCDEF';
			let randomSalt = '';

			for (let i = 0; i < 16; i++) {
				randomSalt += chars[Math.floor(Math.random() * chars.length)];
			}

			salt = randomSalt;
			handleInputChange();
		}

		$$renderer.push(`<div class="card svelte-1jtswco"><header class="card-header svelte-1jtswco"><h1 class="svelte-1jtswco">NSEC3 Hash Calculator</h1> <p class="svelte-1jtswco">Calculate NSEC3 owner hashes for a name given salt, iterations, and algorithm, showing the hashed owner FQDN for
      DNSSEC authenticated denial of existence.</p></header> <div class="card examples-card svelte-1jtswco"><details class="examples-details svelte-1jtswco"><summary class="examples-summary svelte-1jtswco">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-1jtswco">NSEC3 Examples</h4></summary> <div class="examples-grid svelte-1jtswco"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-1jtswco')}><div class="example-title svelte-1jtswco">${$.escape(example.title)}</div> <div class="example-params svelte-1jtswco"><div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Name:</span> <span class="param-value svelte-1jtswco">${$.escape(example.name)}</span></div> <div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Salt:</span> <span class="param-value svelte-1jtswco">${$.escape(example.salt || '(empty)')}</span></div> <div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Iterations:</span> <span class="param-value svelte-1jtswco">${$.escape(example.iterations)}</span></div></div> <div class="example-description svelte-1jtswco">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-1jtswco"><div class="form-group svelte-1jtswco"><label for="domain-name" class="svelte-1jtswco">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Domain Name (FQDN)</label> <input id="domain-name" type="text"${$.attr('value', domainName)} placeholder="www.example.com."${$.attr_class(`domain-input ${isActiveExample ? 'example-active' : ''}`, 'svelte-1jtswco')}/> `);

		if (isActiveExample) {
			$$renderer.push(`<!--[0--><p class="field-help svelte-1jtswco">Using example data - modify to see your results</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1jtswco"><label for="salt-input" class="svelte-1jtswco">`);
		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> Salt (Hexadecimal) <button class="generate-salt-btn svelte-1jtswco" type="button">`);
		Icon($$renderer, { name: 'refresh', size: 'xs' });
		$$renderer.push(`<!----> Generate</button></label> <input id="salt-input" type="text"${$.attr('value', salt)} placeholder="AABBCCDD (or leave empty for no salt)" class="salt-input svelte-1jtswco"/></div> <div class="input-row svelte-1jtswco"><div class="form-group svelte-1jtswco"><label for="iterations" class="svelte-1jtswco">`);
		Icon($$renderer, { name: 'repeat', size: 'sm' });
		$$renderer.push(`<!----> Iterations (0-2500)</label> <input id="iterations" type="number"${$.attr('value', iterations)} min="0" max="2500" class="number-input svelte-1jtswco"/></div> <div class="form-group svelte-1jtswco"><label for="algorithm" class="svelte-1jtswco">`);
		Icon($$renderer, { name: 'hash', size: 'sm' });
		$$renderer.push(`<!----> Hash Algorithm</label> `);

		$$renderer.select(
			{
				id: 'algorithm',
				value: algorithm,
				onchange: handleInputChange,
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(Object.entries(NSEC3_HASH_ALGORITHMS));

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let [value, name] = each_array_1[$$index_1];

					$$renderer.option(
						{ value: Number(value), class: '' },
						($$renderer) => {
							$$renderer.push(`${$.escape(value)} - ${$.escape(name)}`);
						},
						'svelte-1jtswco'
					);
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-1jtswco'
		);

		$$renderer.push(`</div></div> <div class="action-section svelte-1jtswco"><button${$.attr_class('calculate-btn svelte-1jtswco', void 0, { 'loading': calculating })}${$.attr('disabled', !isValid() || calculating, true)}>`);

		if (calculating) {
			$$renderer.push(`<!--[0--><div class="loading svelte-1jtswco"><div class="spinner svelte-1jtswco"></div> <span class="svelte-1jtswco">Calculating Hash...</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'hash', size: 'sm' });
			$$renderer.push(`<!----> <span class="svelte-1jtswco">Calculate NSEC3 Hash</span>`);
		}

		$$renderer.push(`<!--]--></button></div></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card svelte-1jtswco"><div class="error-content svelte-1jtswco">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1jtswco"><strong class="svelte-1jtswco">Calculation Error:</strong> ${$.escape(error)}</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-1jtswco"><div class="results-header svelte-1jtswco"><h3 class="svelte-1jtswco">NSEC3 Hash Result</h3> <div class="header-actions svelte-1jtswco"><button${$.attr_class(`copy-button ${clipboard.isCopied('hash') ? 'copied' : ''}`, 'svelte-1jtswco')}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('hash') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> Copy Hash</button> <button${$.attr_class(`copy-button ${clipboard.isCopied('record') ? 'copied' : ''}`, 'svelte-1jtswco')}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('record') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> Copy Record</button></div></div> <div class="hash-display svelte-1jtswco"><div class="hash-label svelte-1jtswco">NSEC3 Hash</div> <div class="hash-value svelte-1jtswco">${$.escape(result.hash)}</div></div> <div class="details-section svelte-1jtswco"><h4 class="svelte-1jtswco">Calculation Parameters</h4> <div class="details-grid svelte-1jtswco"><div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Original Name</span> <span class="detail-value mono svelte-1jtswco">${$.escape(result.originalName)}</span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Salt</span> <span class="detail-value mono svelte-1jtswco">${$.escape(salt || '(none)')}</span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Iterations</span> <span class="detail-value mono svelte-1jtswco">${$.escape(iterations)}</span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Algorithm</span> <span class="detail-value mono svelte-1jtswco">${$.escape(algorithm)} (${$.escape(NSEC3_HASH_ALGORITHMS[algorithm])})</span></div></div></div> <div class="record-section svelte-1jtswco"><h4 class="svelte-1jtswco">Sample NSEC3 Record</h4> <div class="record-display svelte-1jtswco"><code class="svelte-1jtswco">${$.escape(result.hash)}.example.com. IN NSEC3 1 0 ${$.escape(iterations)} ${$.escape(salt || '-')} ${$.escape(result.hash)} A RRSIG</code></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1jtswco"><div class="education-grid svelte-1jtswco"><div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">NSEC3 Purpose</h4> <p class="svelte-1jtswco">NSEC3 provides authenticated denial of existence for DNS records while preventing zone enumeration. The hash
          function obscures the actual domain names in the zone, making it difficult for attackers to discover all
          records through zone walking.</p></div> <div class="education-item info-panel warning svelte-1jtswco"><h4 class="svelte-1jtswco">Security Considerations</h4> <p class="svelte-1jtswco">Use sufficient iterations (10-100) and a random salt to resist offline dictionary attacks. Higher iteration
          counts increase CPU usage during validation. The salt should be randomly generated and periodically changed
          during zone re-signing.</p></div> <div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">Implementation Notes</h4> <p class="svelte-1jtswco">NSEC3 hashes are calculated by iteratively applying SHA-1 to the concatenation of the domain name (in wire
          format) and salt. The resulting hash is encoded in Base32 without padding and used as the owner name for NSEC3
          records.</p></div> <div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">Performance Impact</h4> <p class="svelte-1jtswco">Higher iteration counts provide better security but increase validation time. Consider server capacity and
          client timeout requirements when choosing iteration values. Typical values range from 5-150 iterations
          depending on security needs.</p></div></div></div></div>`);
	});
}