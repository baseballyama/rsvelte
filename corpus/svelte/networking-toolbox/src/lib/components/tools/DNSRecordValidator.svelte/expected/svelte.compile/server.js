import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

import {
	validateARecord,
	validateAAAARecord,
	validateCNAMERecord,
	validateMXRecord,
	validateTXTRecord,
	validateSRVRecord,
	validateCAARecord
} from '$lib/utils/dns-validation.js';

import { useClipboard } from '$lib/composables';

export default function DNSRecordValidator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let recordType = 'A';
		let recordName = 'example.com';
		let recordValue = '192.168.1.1';
		let ttl = 3600;

		// Additional fields for specific record types
		let priority = 10;

		let weight = 0;
		let port = 443;
		let service = '_http';
		let protocol = '_tcp';
		let flags = 0;
		let tag = 'issue';
		let results = null;
		const clipboard = useClipboard();

		const recordTypes = [
			{
				value: 'A',
				label: 'A (IPv4 Address)',
				description: 'Maps domain to IPv4 address'
			},

			{
				value: 'AAAA',
				label: 'AAAA (IPv6 Address)',
				description: 'Maps domain to IPv6 address'
			},

			{
				value: 'CNAME',
				label: 'CNAME (Canonical Name)',
				description: 'Alias to another domain'
			},

			{
				value: 'MX',
				label: 'MX (Mail Exchange)',
				description: 'Mail server for domain'
			},

			{
				value: 'TXT',
				label: 'TXT (Text)',
				description: 'Arbitrary text data'
			},

			{
				value: 'SRV',
				label: 'SRV (Service)',
				description: 'Service location and port'
			},

			{
				value: 'CAA',
				label: 'CAA (Certificate Authority)',
				description: 'Certificate authority authorization'
			}
		];

		const examples = [
			{
				type: 'A',
				name: 'www.example.com',
				value: '192.0.2.1',
				description: 'Basic web server A record'
			},

			{
				type: 'AAAA',
				name: 'www.example.com',
				value: '2001:db8::1',
				description: 'IPv6 web server record'
			},

			{
				type: 'CNAME',
				name: 'blog.example.com',
				value: 'www.example.com.',
				description: 'Blog subdomain alias'
			},

			{
				type: 'MX',
				name: 'example.com',
				value: 'mail.example.com.',
				priority: 10,
				description: 'Primary mail server'
			},

			{
				type: 'TXT',
				name: 'example.com',
				value: 'v=spf1 include:_spf.google.com ~all',
				description: 'SPF policy record'
			},

			{
				type: 'SRV',
				name: '_https._tcp.example.com',
				value: 'server.example.com.',
				priority: 0,
				weight: 5,
				port: 443,
				description: 'HTTPS service record'
			}
		];

		function loadExample(example) {
			recordType = example.type;
			recordName = example.name;
			recordValue = example.value;

			if ('priority' in example && example.priority !== undefined) {
				priority = example.priority;
			}

			if ('weight' in example && example.weight !== undefined) {
				weight = example.weight;
			}

			if ('port' in example && example.port !== undefined) {
				port = example.port;
			}

			validateRecord();
		}

		function validateRecord() {
			if (!recordValue.trim()) {
				results = null;

				return;
			}

			try {
				switch (recordType) {
					case 'A':
						results = validateARecord(recordValue);
						break;

					case 'AAAA':
						results = validateAAAARecord(recordValue);
						break;

					case 'CNAME':
						results = validateCNAMERecord(recordValue);
						break;

					case 'MX':
						results = validateMXRecord(recordValue, priority);
						break;

					case 'TXT':
						results = validateTXTRecord(recordValue);
						break;

					case 'SRV':
						results = validateSRVRecord(service, protocol, priority, weight, port, recordValue);
						break;

					case 'CAA':
						results = validateCAARecord(flags, tag, recordValue);
						break;

					default:
						results = {
							valid: false,
							errors: [`Unsupported record type: ${recordType}`],
							warnings: []
						};
				}
			} catch(error) {
				results = {
					valid: false,
					errors: [error instanceof Error ? error.message : 'Validation error'],
					warnings: []
				};
			}
		}

		function formatRecord() {
			switch (recordType) {
				case 'A':

				case 'AAAA':

				case 'CNAME':
					return `${recordName} ${ttl} IN ${recordType} ${recordValue}`;

				case 'MX':
					return `${recordName} ${ttl} IN MX ${priority} ${recordValue}`;

				case 'TXT':
					return `${recordName} ${ttl} IN TXT "${recordValue}"`;

				case 'SRV':
					return `${service}.${protocol}.${recordName} ${ttl} IN SRV ${priority} ${weight} ${port} ${recordValue}`;

				case 'CAA':
					return `${recordName} ${ttl} IN CAA ${flags} ${tag} "${recordValue}"`;

				default:
					return `${recordName} ${ttl} IN ${recordType} ${recordValue}`;
			}
		}

		// Validate on component load and when inputs change
		function handleInputChange() {
			validateRecord();
		}

		validateRecord();
		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Record Validator</h1> <p>Validate individual DNS resource record syntax for proper formatting and common issues</p></header> <div class="card info-card svelte-nopgro"><div class="overview-content svelte-nopgro"><div class="overview-item svelte-nopgro">`);
		Icon($$renderer, { name: 'check-circle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-nopgro">Syntax Validation:</strong> Verify record values match RFC specifications for format and constraints.</div></div> <div class="overview-item svelte-nopgro">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-nopgro">Error Detection:</strong> Identify format errors, range violations, and protocol mismatches.</div></div> <div class="overview-item svelte-nopgro">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-nopgro">Best Practices:</strong> Get warnings about potential issues and optimization suggestions.</div></div></div></div> <div class="card examples-card svelte-nopgro"><details class="examples-details svelte-nopgro"><summary class="examples-summary svelte-nopgro">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-nopgro">Quick Examples</h3></summary> <div class="examples-grid svelte-nopgro"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button class="example-card svelte-nopgro"><div class="example-header svelte-nopgro"><span class="record-type-badge svelte-nopgro">${$.escape(example.type)}</span> <span class="example-name svelte-nopgro">${$.escape(example.name)}</span></div> <code class="example-value svelte-nopgro">${$.escape(example.value)}</code> <div class="example-description svelte-nopgro">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-nopgro"><div class="input-group svelte-nopgro"><label for="record-type" class="svelte-nopgro">`);
		Icon($$renderer, { name: 'tag', size: 'sm' });
		$$renderer.push(`<!----> Record Type</label> `);

		$$renderer.select(
			{
				id: 'record-type',
				value: recordType,
				onchange: handleInputChange,
				class: 'record-type-select'
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(recordTypes);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let type = each_array_1[$$index_1];

					$$renderer.option({ value: type.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(type.label)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-nopgro'
		);

		$$renderer.push(` <div class="record-type-description svelte-nopgro">${$.escape(recordTypes.find((t) => t.value === recordType)?.description || '')}</div></div> <div class="input-group svelte-nopgro"><label for="record-name" class="svelte-nopgro">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Record Name</label> <input id="record-name" type="text"${$.attr('value', recordName)} placeholder="example.com" class="record-name-input svelte-nopgro" spellcheck="false"/></div> <div class="input-group svelte-nopgro"><label for="record-value" class="svelte-nopgro">`);
		Icon($$renderer, { name: 'edit', size: 'sm' });
		$$renderer.push(`<!----> Record Value</label> `);

		if (recordType === 'TXT') {
			$$renderer.push(`<!--[0--><textarea id="record-value" placeholder="Enter TXT record content..." class="record-value-textarea svelte-nopgro" rows="3" spellcheck="false">`);

			const $$body = $.escape(recordValue);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea>`);
		} else {
			$$renderer.push(`<!--[-1--><input id="record-value" type="text"${$.attr('value', recordValue)}${$.attr('placeholder', recordType === 'A'
				? '192.0.2.1'
				: recordType === 'AAAA' ? '2001:db8::1' : 'Record value...')}${$.attr_class(`record-value-input ${results?.valid === true ? 'valid' : results?.valid === false ? 'invalid' : ''}`, 'svelte-nopgro')} spellcheck="false"/>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (recordType === 'MX') {
			$$renderer.push(`<!--[0--><div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="priority" class="svelte-nopgro">Priority</label> <input id="priority" type="number"${$.attr('value', priority)} min="0" max="65535" class="priority-input svelte-nopgro"/></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (recordType === 'SRV') {
			$$renderer.push(`<!--[0--><div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="service" class="svelte-nopgro">Service</label> <input id="service" type="text"${$.attr('value', service)} placeholder="_http" class="service-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="protocol" class="svelte-nopgro">Protocol</label> `);

			$$renderer.select(
				{
					id: 'protocol',
					value: protocol,
					onchange: handleInputChange,
					class: 'protocol-select'
				},
				($$renderer) => {
					$$renderer.option({ value: '_tcp' }, ($$renderer) => {
						$$renderer.push(`_tcp`);
					});

					$$renderer.option({ value: '_udp' }, ($$renderer) => {
						$$renderer.push(`_udp`);
					});
				},
				'svelte-nopgro'
			);

			$$renderer.push(`</div> <div class="field-group svelte-nopgro"><label for="srv-priority" class="svelte-nopgro">Priority</label> <input id="srv-priority" type="number"${$.attr('value', priority)} min="0" max="65535" class="priority-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="weight" class="svelte-nopgro">Weight</label> <input id="weight" type="number"${$.attr('value', weight)} min="0" max="65535" class="weight-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="port" class="svelte-nopgro">Port</label> <input id="port" type="number"${$.attr('value', port)} min="0" max="65535" class="port-input svelte-nopgro"/></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (recordType === 'CAA') {
			$$renderer.push(`<!--[0--><div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="flags" class="svelte-nopgro">Flags</label> <input id="flags" type="number"${$.attr('value', flags)} min="0" max="255" class="flags-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="tag" class="svelte-nopgro">Tag</label> `);

			$$renderer.select(
				{
					id: 'tag',
					value: tag,
					onchange: handleInputChange,
					class: 'tag-select'
				},
				($$renderer) => {
					$$renderer.option({ value: 'issue' }, ($$renderer) => {
						$$renderer.push(`issue`);
					});

					$$renderer.option({ value: 'issuewild' }, ($$renderer) => {
						$$renderer.push(`issuewild`);
					});

					$$renderer.option({ value: 'iodef' }, ($$renderer) => {
						$$renderer.push(`iodef`);
					});
				},
				'svelte-nopgro'
			);

			$$renderer.push(`</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="input-group svelte-nopgro"><label for="ttl" class="svelte-nopgro">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> TTL (seconds)</label> <input id="ttl" type="number"${$.attr('value', ttl)} min="0" max="2147483647" placeholder="3600" class="ttl-input svelte-nopgro"/></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-nopgro"><div class="results-header svelte-nopgro"><div${$.attr_class(`validation-status ${results.valid ? 'valid' : 'invalid'}`, 'svelte-nopgro')}>`);

			Icon($$renderer, {
				name: results.valid ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>${$.escape(results.valid ? 'Valid' : 'Invalid')} DNS Record</span></div> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-nopgro')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy Zone Line</button></div> <div class="formatted-record svelte-nopgro"><h4 class="svelte-nopgro">Zone File Format:</h4> <pre class="svelte-nopgro"><code class="svelte-nopgro">${$.escape(formatRecord())}</code></pre></div> `);

			if (results.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="validation-section errors svelte-nopgro"><h4 class="svelte-nopgro">`);
				Icon($$renderer, { name: 'x-circle', size: 'sm' });
				$$renderer.push(`<!----> Errors (${$.escape(results.errors.length)})</h4> <ul class="validation-list svelte-nopgro"><!--[-->`);

				const each_array_2 = $.ensure_array_like(results.errors);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let error = each_array_2[index];

					$$renderer.push(`<li class="error-item svelte-nopgro">${$.escape(error)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.warnings.length > 0) {
				$$renderer.push(`<!--[0--><div class="validation-section warnings svelte-nopgro"><h4 class="svelte-nopgro">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Warnings (${$.escape(results.warnings.length)})</h4> <ul class="validation-list svelte-nopgro"><!--[-->`);

				const each_array_3 = $.ensure_array_like(results.warnings);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let warning = each_array_3[index];

					$$renderer.push(`<li class="warning-item svelte-nopgro">${$.escape(warning)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.normalized && results.normalized !== recordValue) {
				$$renderer.push(`<!--[0--><div class="validation-section normalized svelte-nopgro"><h4 class="svelte-nopgro">`);
				Icon($$renderer, { name: 'check', size: 'sm' });
				$$renderer.push(`<!----> Normalized Value</h4> <code class="normalized-value svelte-nopgro">${$.escape(results.normalized)}</code></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-nopgro"><div class="education-grid svelte-nopgro"><div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Common Record Types</h4> <p class="svelte-nopgro">A/AAAA records map domains to IP addresses. CNAME creates aliases. MX directs email. TXT stores arbitrary data
          like SPF policies. SRV specifies service locations.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Validation Scope</h4> <p class="svelte-nopgro">This validator checks syntax, format, and common configuration issues. It doesn't verify that targets exist or
          are reachable - use DNS lookup tools for connectivity testing.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">TTL Guidelines</h4> <p class="svelte-nopgro">Use shorter TTLs (300-3600s) for records that change frequently. Longer TTLs (3600-86400s) reduce DNS queries
          but slow propagation of changes. Balance based on your needs.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Best Practices</h4> <p class="svelte-nopgro">Always use fully qualified domain names (ending with .) in record values. Validate SPF/DMARC policies
          carefully. Keep MX priorities consistent. Use descriptive TXT record formatting.</p></div></div></div></div>`);
	});
}