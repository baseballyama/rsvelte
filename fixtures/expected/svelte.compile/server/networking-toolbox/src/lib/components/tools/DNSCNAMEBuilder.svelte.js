import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';
import { SvelteSet } from 'svelte/reactivity';

export default function DNSCNAMEBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let aliasInput = '';
		let targetInput = '';
		let ttl = 3600;
		let generateMultiple = false;
		let results = [];
		let showExamples = false;

		const examples = [
			{
				label: 'Web Aliases',
				aliases: 'www\nblog\nshop\napi',
				targets: 'server1.example.com.\nwordpress.hosting.com.\necommerce.platform.com.\napi-gateway.example.com.'
			},

			{
				label: 'Service Redirects',
				aliases: 'mail\nftp\nvpn',
				targets: 'mailserver.example.com.\nftpserver.example.com.\nvpngateway.example.com.'
			},

			{
				label: 'CDN Configuration',
				aliases: 'cdn\nstatic\nassets\nimages',
				targets: 'cdn.cloudflare.com.\nstatic.fastly.com.\nassets.cloudfront.net.\nimg.amazonaws.com.'
			}
		];

		function isValidHostname(hostname) {
			if (!hostname || hostname.length > 253) return false;

			// Remove trailing dot for validation
			const host = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;

			// Check each label
			const labels = host.split('.');

			if (labels.length < 1) return false;

			return labels.every((label) => {
				if (label.length === 0 || label.length > 63) return false;
				if (label.startsWith('-') || label.endsWith('-')) return false;

				return (/^[a-zA-Z0-9-]+$/).test(label);
			});
		}

		function validateCNAME(alias, target, allRecords) {
			// Check format validity
			if (!isValidHostname(alias) || !isValidHostname(target)) {
				return 'invalid-format';
			}

			// Ensure target ends with dot (FQDN)
			if (!target.endsWith('.')) {
				return 'missing-dot';
			}

			// Check for self-targeting
			const aliasNormalized = alias.endsWith('.') ? alias : alias + '.';

			if (aliasNormalized === target) {
				return 'self-target';
			}

			// Check for loops
			const visited = new SvelteSet();

			let current = target;

			while (current) {
				if (visited.has(current)) {
					return 'loop';
				}

				visited.add(current);

				// Find if current target is also an alias in our records
				const nextRecord = allRecords.find((r) => {
					const recordAlias = r.alias.endsWith('.') ? r.alias : r.alias + '.';

					return recordAlias === current;
				});

				if (nextRecord) {
					current = nextRecord.target;
				} else {
					break;
				}
			}

			return 'valid';
		}

		function generateRecords() {
			if (generateMultiple) {
				const aliases = aliasInput.split('\n').map((a) => a.trim()).filter((a) => a);
				const targets = targetInput.split('\n').map((t) => t.trim()).filter((t) => t);

				if (aliases.length === 0 || targets.length === 0) {
					results = [];

					return;
				}

				const newResults = [];
				const maxLength = Math.max(aliases.length, targets.length);

				for (let i = 0; i < maxLength; i++) {
					const alias = aliases[i % aliases.length];
					const target = targets[i % targets.length];

					if (alias && target) {
						newResults.push({
							alias,
							target,
							ttl,
							status: 'valid' // Will be validated after all records are created
						});
					}
				}

				// Validate all records for loops
				newResults.forEach((record) => {
					record.status = validateCNAME(record.alias, record.target, newResults);
				});

				results = newResults;
			} else {
				// Single record mode
				if (aliasInput.trim() && targetInput.trim()) {
					const singleResult = [
						{
							alias: aliasInput.trim(),
							target: targetInput.trim(),
							ttl,
							status: validateCNAME(aliasInput.trim(), targetInput.trim(), [])
						}
					];

					results = singleResult;
				} else {
					results = [];
				}
			}
		}

		function loadExample(example) {
			aliasInput = example.aliases;
			targetInput = example.targets;
			generateMultiple = true;
			generateRecords();
		}

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text);
		}

		function getStatusInfo(status) {
			switch (status) {
				case 'valid':
					return { icon: 'check-circle', class: 'success', text: 'Valid' };

				case 'loop':
					return {
						icon: 'alert-triangle',
						class: 'error',
						text: 'Loop Detected'
					};

				case 'self-target':
					return { icon: 'alert-triangle', class: 'error', text: 'Self Target' };

				case 'invalid-format':
					return { icon: 'x-circle', class: 'error', text: 'Invalid Format' };

				case 'missing-dot':
					return { icon: 'info', class: 'warning', text: 'Missing FQDN Dot' };

				default:
					return { icon: 'help-circle', class: 'info', text: 'Unknown' };
			}
		}

		$$renderer.push(`<div class="card"><div class="card-header svelte-xbg2dq"><h1>CNAME Builder</h1> <p class="card-subtitle svelte-xbg2dq">Build valid CNAME records with loop detection, self-target checks, and FQDN validation.</p></div> <div class="grid-layout svelte-xbg2dq"><div class="input-section svelte-xbg2dq"><div class="mode-selector svelte-xbg2dq"><label class="checkbox-option svelte-xbg2dq"><input type="checkbox"${$.attr('checked', generateMultiple, true)} class="svelte-xbg2dq"/> <span class="checkmark svelte-xbg2dq"></span> Bulk mode (multiple records)</label></div> `);

		if (generateMultiple) {
			$$renderer.push(`<!--[0--><div class="input-group"><label for="aliases">`);
			Icon($$renderer, { name: 'alias', size: 'sm' });

			$$renderer.push(`<!----> Alias Names</label> <textarea id="aliases" placeholder="www
blog
mail
ftp" rows="6" class="svelte-xbg2dq">`);

			const $$body = $.escape(aliasInput);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea></div> <div class="input-group"><label for="targets">`);
			Icon($$renderer, { name: 'target', size: 'sm' });

			$$renderer.push(`<!----> Target FQDNs</label> <textarea id="targets" placeholder="server1.example.com.
server2.example.com.
mailserver.example.com.
ftpserver.example.com." rows="6" class="svelte-xbg2dq">`);

			const $$body_1 = $.escape(targetInput);

			if ($$body_1) {
				$$renderer.push(`${$$body_1}`);
			} else {}

			$$renderer.push(`</textarea></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="input-group"><label for="alias">`);
			Icon($$renderer, { name: 'alias', size: 'sm' });
			$$renderer.push(`<!----> Alias Name</label> <input type="text" id="alias"${$.attr('value', aliasInput)} placeholder="www" class="svelte-xbg2dq"/></div> <div class="input-group"><label for="target">`);
			Icon($$renderer, { name: 'target', size: 'sm' });
			$$renderer.push(`<!----> Target FQDN</label> <input type="text" id="target"${$.attr('value', targetInput)} placeholder="server1.example.com." class="svelte-xbg2dq"/></div>`);
		}

		$$renderer.push(`<!--]--> <div class="controls-row svelte-xbg2dq"><div class="input-group"><label for="ttl">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> TTL (seconds)</label> <input type="number" id="ttl"${$.attr('value', ttl)} min="60" max="86400" class="svelte-xbg2dq"/></div></div></div> <div class="examples-section svelte-xbg2dq"><details class="examples-toggle svelte-xbg2dq"${$.attr('open', showExamples, true)}><summary class="svelte-xbg2dq">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Quick Examples</summary> <div class="examples-grid svelte-xbg2dq"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button class="example-card svelte-xbg2dq"><h4 class="svelte-xbg2dq">${$.escape(example.label)}</h4> <p class="svelte-xbg2dq">${$.escape(example.aliases.split('\n').length)} records</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details> <div class="info-panel svelte-xbg2dq"><h4 class="svelte-xbg2dq">CNAME Best Practices</h4> <ul class="svelte-xbg2dq"><li class="svelte-xbg2dq">Target must be a Fully Qualified Domain Name (FQDN) ending with a dot</li> <li class="svelte-xbg2dq">CNAME records cannot coexist with other record types</li> <li class="svelte-xbg2dq">Avoid CNAME chains longer than 3-4 hops</li> <li class="svelte-xbg2dq">Never point a CNAME to another CNAME if possible</li></ul></div></div></div> `);

		if (results.length > 0) {
			$$renderer.push(`<!--[0--><div class="results-section svelte-xbg2dq"><div class="results-header svelte-xbg2dq"><h2 class="svelte-xbg2dq">Generated CNAME Records</h2> <div class="export-buttons svelte-xbg2dq"><button class="svelte-xbg2dq">`);
			Icon($$renderer, { name: 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy Records</button></div></div> <div class="records-table svelte-xbg2dq"><div class="table-header svelte-xbg2dq"><div class="svelte-xbg2dq">Alias</div> <div class="svelte-xbg2dq">TTL</div> <div class="svelte-xbg2dq">Type</div> <div class="svelte-xbg2dq">Target</div> <div class="svelte-xbg2dq">Status</div></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(results);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let record = each_array_1[index];
				const statusInfo = getStatusInfo(record.status);

				$$renderer.push(`<div${$.attr_class('table-row svelte-xbg2dq', void 0, { 'error': record.status !== 'valid' })}><div class="alias svelte-xbg2dq">${$.escape(record.alias)}</div> <div class="ttl svelte-xbg2dq">${$.escape(record.ttl)}</div> <div class="type svelte-xbg2dq"><span class="record-type svelte-xbg2dq">CNAME</span></div> <div class="target svelte-xbg2dq">${$.escape(record.target)}</div> <div class="status svelte-xbg2dq"><span${$.attr_class(`status-badge ${$.stringify(statusInfo.class)}`, 'svelte-xbg2dq')}>`);
				Icon($$renderer, { name: statusInfo.icon, size: 'xs' });
				$$renderer.push(`<!----> ${$.escape(statusInfo.text)}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (results.some((r) => r.status !== 'valid')) {
				$$renderer.push(`<!--[0--><div class="validation-warnings svelte-xbg2dq"><h3 class="svelte-xbg2dq">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Validation Issues</h3> <ul class="svelte-xbg2dq"><!--[-->`);

				const each_array_2 = $.ensure_array_like(results.filter((r) => r.status !== 'valid'));

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let record = each_array_2[index];
					const statusInfo = getStatusInfo(record.status);

					$$renderer.push(`<li${$.attr_class(`warning-item ${$.stringify(statusInfo.class)}`, 'svelte-xbg2dq')}><strong>${$.escape(record.alias)}</strong>: ${$.escape(statusInfo.text)} `);

					if (record.status === 'missing-dot') {
						$$renderer.push(`<!--[0-->- Target should end with '.' to be a proper FQDN`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (record.status === 'loop') {
						$$renderer.push(`<!--[0-->- Creates a circular reference that will cause DNS resolution to fail`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (record.status === 'self-target') {
						$$renderer.push(`<!--[0-->- Points to itself, which is not allowed`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}