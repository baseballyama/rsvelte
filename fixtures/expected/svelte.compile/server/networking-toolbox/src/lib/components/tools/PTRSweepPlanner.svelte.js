import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { analyzePTRCoverage } from '$lib/utils/reverse-dns.js';

export default function PTRSweepPlanner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let cidrInput = '192.168.1.0/24';

		let existingPTRsInput = `100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
105.1.168.192.in-addr.arpa
200.1.168.192.in-addr.arpa`;

		let namingPattern = '.*\\.example\\.com\\.$';
		let results = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

		const examples = [
			{
				label: 'Partial Coverage',
				cidr: '192.168.1.0/28',
				ptrs: `100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
105.1.168.192.in-addr.arpa`,
				pattern: '.*\\.example\\.com\\.$',
				description: 'Network with some missing PTRs'
			},

			{
				label: 'Mixed Naming',
				cidr: '10.0.0.0/28',
				ptrs: `1.0.0.10.in-addr.arpa
2.0.0.10.in-addr.arpa
10.0.0.10.in-addr.arpa
15.0.0.10.in-addr.arpa
20.0.0.10.in-addr.arpa`,
				pattern: 'host-.*\\.corp\\.com\\.$',
				description: 'Check pattern compliance'
			},

			{
				label: 'IPv6 Network',
				cidr: '2001:db8:1000::/64',
				ptrs: `0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.8.b.d.0.1.0.0.2.ip6.arpa
1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.8.b.d.0.1.0.0.2.ip6.arpa`,
				pattern: '.*\\.ipv6\\.example\\.com\\.$',
				description: 'IPv6 PTR coverage analysis'
			}
		];

		const patternHelp = [
			{
				pattern: '.*\\.example\\.com\\.$',
				description: 'Any hostname ending in .example.com.'
			},

			{
				pattern: 'host-.*\\.corp\\.com\\.$',
				description: 'Hostnames starting with "host-" in corp.com'
			},

			{
				pattern: '^[0-9-]+\\.net\\.example\\.com\\.$',
				description: 'IP-based hostnames in net.example.com'
			},

			{
				pattern: '(server|workstation)-.*',
				description: 'Names starting with "server-" or "workstation-"'
			}
		];

		function loadExample(example) {
			cidrInput = example.cidr;
			existingPTRsInput = example.ptrs;
			namingPattern = example.pattern;
			selectedExample = example.label;
			_userModified = false;
			analyzeCoverage();
		}

		function analyzeCoverage() {
			if (!cidrInput.trim()) {
				results = null;

				return;
			}

			try {
				const trimmedCidr = cidrInput.trim();
				const existingPTRs = existingPTRsInput.split('\n').map((ptr) => ptr.trim()).filter((ptr) => ptr.length > 0);
				const analysis = analyzePTRCoverage(trimmedCidr, existingPTRs, namingPattern.trim() || undefined);

				results = { success: true, analysis };
			} catch(error) {
				results = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					analysis: {
						cidr: '',
						totalAddresses: 0,
						expectedPTRs: [],
						missingPTRs: [],
						extraPTRs: [],
						patternMatches: 0,
						coverage: 0
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			analyzeCoverage();
		}

		function _generateDigCommands(missingPTRs) {
			return missingPTRs.slice(0, 20).map((ptr) => `dig +short -x ${ptr.replace(/(.*\.in-addr\.arpa|.*\.ip6\.arpa)$/, (match, domain) => {
				if (domain.includes('in-addr.arpa')) {
					// Convert IPv4 PTR back to IP
					const parts = domain.replace('.in-addr.arpa', '').split('.');

					return parts.reverse().join('.');
				} else {
					// IPv6 conversion is more complex, skip for now
					return ptr;
				}
			})}`).join('\n');
		}

		function generateCreateCommands(missingPTRs) {
			return missingPTRs.slice(0, 20).map((ptr) => {
				const recordName = ptr.split('.').slice(0, -4).join('.');

				return `${recordName}    IN    PTR    host-${recordName.split('.').reverse().join('-')}.example.com.`;
			}).join('\n');
		}

		// Analyze on component load
		analyzeCoverage();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>PTR Sweep Planner</h1> <p>Analyze PTR record coverage for network blocks and identify missing or extra records</p></header> <div class="card info-card svelte-lsjtaq"><div class="overview-content svelte-lsjtaq"><div class="overview-item svelte-lsjtaq">`);
		Icon($$renderer, { name: 'search', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-lsjtaq">Coverage Analysis:</strong> Compare expected PTR records for a CIDR block against actual existing records.</div></div> <div class="overview-item svelte-lsjtaq">`);
		Icon($$renderer, { name: 'target', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-lsjtaq">Pattern Matching:</strong> Validate existing PTR records against regex naming patterns for compliance.</div></div> <div class="overview-item svelte-lsjtaq">`);
		Icon($$renderer, { name: 'list-check', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-lsjtaq">Gap Analysis:</strong> Identify missing PTRs, extra PTRs, and generate remediation plans.</div></div></div></div> <div class="card examples-card svelte-lsjtaq"><details class="examples-details svelte-lsjtaq"><summary class="examples-summary svelte-lsjtaq">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-lsjtaq">Quick Examples</h3></summary> <div class="examples-grid svelte-lsjtaq"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
			let example = each_array[idx];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-lsjtaq')}><div class="example-header"><div class="example-label svelte-lsjtaq">${$.escape(example.label)}</div></div> <div class="example-details svelte-lsjtaq"><div class="example-field svelte-lsjtaq">CIDR: <code class="svelte-lsjtaq">${$.escape(example.cidr)}</code></div> <div class="example-field svelte-lsjtaq">Pattern: <code class="svelte-lsjtaq">${$.escape(example.pattern)}</code></div> <div class="example-field svelte-lsjtaq">PTRs: ${$.escape(example.ptrs.split('\n').length)} records</div></div> <div class="example-description svelte-lsjtaq">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-lsjtaq"><div class="input-group svelte-lsjtaq"><label for="cidr-input" class="svelte-lsjtaq">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> CIDR Block to Analyze</label> <input id="cidr-input" type="text"${$.attr('value', cidrInput)} placeholder="192.168.1.0/24 or 2001:db8::/64"${$.attr_class(`cidr-input ${results?.success === true ? 'valid' : results?.success === false ? 'invalid' : ''}`, 'svelte-lsjtaq')} spellcheck="false"/></div> <div class="input-group svelte-lsjtaq"><label for="ptrs-input" class="svelte-lsjtaq">`);
		Icon($$renderer, { name: 'list', size: 'sm' });

		$$renderer.push(`<!----> Existing PTR Records</label> <textarea id="ptrs-input" placeholder="100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
..." class="ptrs-input svelte-lsjtaq" rows="8" spellcheck="false">`);

		const $$body = $.escape(existingPTRsInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="input-group svelte-lsjtaq"><label for="pattern-input" class="svelte-lsjtaq">`);
		Icon($$renderer, { name: 'search', size: 'sm' });
		$$renderer.push(`<!----> Naming Pattern (Optional)</label> <input id="pattern-input" type="text"${$.attr('value', namingPattern)} placeholder=".*\\.example\\.com\\.$" class="pattern-input svelte-lsjtaq" spellcheck="false"/> <div class="pattern-help svelte-lsjtaq"><h4 class="svelte-lsjtaq">Common Patterns:</h4> <div class="pattern-examples svelte-lsjtaq"><!--[-->`);

		const each_array_1 = $.ensure_array_like(patternHelp);

		for (let helpIdx = 0, $$length = each_array_1.length; helpIdx < $$length; helpIdx++) {
			let item = each_array_1[helpIdx];

			$$renderer.push(`<button class="pattern-example svelte-lsjtaq"><code class="pattern-code svelte-lsjtaq">${$.escape(item.pattern)}</code> <span class="pattern-desc svelte-lsjtaq">${$.escape(item.description)}</span></button>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div> `);

		if (results && cidrInput.trim()) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-lsjtaq">`);

			if (results.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-lsjtaq"><h3 class="svelte-lsjtaq">Coverage Analysis Results</h3> <div class="coverage-meter svelte-lsjtaq"><div class="coverage-bar svelte-lsjtaq"><div${$.attr_class(
					`coverage-fill ${results.analysis.coverage >= 80
						? 'good'
						: results.analysis.coverage >= 50 ? 'fair' : 'poor'}`,
					'svelte-lsjtaq'
				)}${$.attr_style(`width: ${$.stringify(results.analysis.coverage)}%`)}></div></div> <div class="coverage-text svelte-lsjtaq">${$.escape(results.analysis.coverage.toFixed(1))}% Coverage</div></div></div> <div class="summary-stats svelte-lsjtaq"><div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq">${$.escape(results.analysis.totalAddresses)}</span> <span class="stat-label svelte-lsjtaq">Expected PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq">${$.escape(results.analysis.totalAddresses - results.analysis.missingPTRs.length)}</span> <span class="stat-label svelte-lsjtaq">Found PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq">${$.escape(results.analysis.missingPTRs.length)}</span> <span class="stat-label svelte-lsjtaq">Missing PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq">${$.escape(results.analysis.extraPTRs.length)}</span> <span class="stat-label svelte-lsjtaq">Extra PTRs</span></div> `);

				if (namingPattern.trim()) {
					$$renderer.push(`<!--[0--><div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq">${$.escape(results.analysis.patternMatches)}</span> <span class="stat-label svelte-lsjtaq">Pattern Matches</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="analysis-sections svelte-lsjtaq">`);

				if (results.analysis.missingPTRs.length > 0) {
					$$renderer.push(`<!--[0--><div class="analysis-section svelte-lsjtaq"><div class="section-header svelte-lsjtaq"><h4 class="svelte-lsjtaq">`);
					Icon($$renderer, { name: 'alert-circle', size: 'sm' });
					$$renderer.push(`<!----> Missing PTR Records (${$.escape(results.analysis.missingPTRs.length)})</h4> <button${$.attr_class(`copy-button ${clipboard.isCopied('missing-ptrs') ? 'copied' : ''}`, 'svelte-lsjtaq')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('missing-ptrs') ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> Copy List</button></div> <div class="records-list svelte-lsjtaq"><!--[-->`);

					const each_array_2 = $.ensure_array_like(results.analysis.missingPTRs.slice(0, 20));

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let ptr = each_array_2[index];

						$$renderer.push(`<div class="record-item missing svelte-lsjtaq"><code class="svelte-lsjtaq">${$.escape(ptr)}</code></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (results.analysis.missingPTRs.length > 20) {
						$$renderer.push(`<!--[0--><div class="records-truncated svelte-lsjtaq">... and ${$.escape(results.analysis.missingPTRs.length - 20)} more missing records</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.analysis.extraPTRs.length > 0) {
					$$renderer.push(`<!--[0--><div class="analysis-section svelte-lsjtaq"><div class="section-header svelte-lsjtaq"><h4 class="svelte-lsjtaq">`);
					Icon($$renderer, { name: 'plus-circle', size: 'sm' });
					$$renderer.push(`<!----> Extra PTR Records (${$.escape(results.analysis.extraPTRs.length)})</h4> <button${$.attr_class(`copy-button ${clipboard.isCopied('extra-ptrs') ? 'copied' : ''}`, 'svelte-lsjtaq')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('extra-ptrs') ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> Copy List</button></div> <div class="records-list svelte-lsjtaq"><!--[-->`);

					const each_array_3 = $.ensure_array_like(results.analysis.extraPTRs.slice(0, 10));

					for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
						let ptr = each_array_3[index];

						$$renderer.push(`<div class="record-item extra svelte-lsjtaq"><code class="svelte-lsjtaq">${$.escape(ptr)}</code></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (results.analysis.extraPTRs.length > 10) {
						$$renderer.push(`<!--[0--><div class="records-truncated svelte-lsjtaq">... and ${$.escape(results.analysis.extraPTRs.length - 10)} more extra records</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="analysis-section svelte-lsjtaq"><div class="section-header svelte-lsjtaq"><h4 class="svelte-lsjtaq">`);
				Icon($$renderer, { name: 'clipboard-list', size: 'sm' });
				$$renderer.push(`<!----> Recommended Actions</h4></div> <div class="action-items svelte-lsjtaq">`);

				if (results.analysis.missingPTRs.length > 0) {
					$$renderer.push(`<!--[0--><div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq">`);
					Icon($$renderer, { name: 'plus', size: 'sm' });
					$$renderer.push(`<!----> <span>Create Missing PTR Records</span> <button${$.attr_class(`copy-button ${clipboard.isCopied('create-commands') ? 'copied' : ''}`, 'svelte-lsjtaq')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('create-commands') ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> Copy Zone Lines</button></div> <div class="action-description svelte-lsjtaq">Add ${$.escape(results.analysis.missingPTRs.length)} missing PTR records to your reverse zone files.</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.analysis.extraPTRs.length > 0) {
					$$renderer.push(`<!--[0--><div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq">`);
					Icon($$renderer, { name: 'trash-2', size: 'sm' });

					$$renderer.push(`<!----> <span>Review Extra Records</span></div> <div class="action-description svelte-lsjtaq">Review ${$.escape(results.analysis.extraPTRs.length)} extra PTR records that don't correspond to addresses in this
                    CIDR block.</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (namingPattern.trim() && results.analysis.patternMatches < results.analysis.totalAddresses - results.analysis.missingPTRs.length) {
					$$renderer.push(`<!--[0--><div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq">`);
					Icon($$renderer, { name: 'edit', size: 'sm' });
					$$renderer.push(`<!----> <span>Fix Naming Pattern Violations</span></div> <div class="action-description svelte-lsjtaq">${$.escape(results.analysis.totalAddresses - results.analysis.missingPTRs.length - results.analysis.patternMatches)} existing PTR records don't match the naming pattern.</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.analysis.coverage >= 95) {
					$$renderer.push(`<!--[0--><div class="action-item success svelte-lsjtaq"><div class="action-header svelte-lsjtaq">`);
					Icon($$renderer, { name: 'check-circle', size: 'sm' });
					$$renderer.push(`<!----> <span>Excellent Coverage!</span></div> <div class="action-description svelte-lsjtaq">Your reverse DNS coverage is excellent with ${$.escape(results.analysis.coverage.toFixed(1))}% completeness.</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-lsjtaq">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-lsjtaq">Analysis Error</h4> <p class="svelte-lsjtaq">${$.escape(results.error)}</p> <div class="error-help svelte-lsjtaq"><strong>Check your input:</strong> <ul class="svelte-lsjtaq"><li class="svelte-lsjtaq">CIDR notation: 192.168.1.0/24, 2001:db8::/64</li> <li class="svelte-lsjtaq">PTR records: One per line, proper format</li> <li class="svelte-lsjtaq">Pattern: Valid JavaScript regex syntax</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-lsjtaq"><div class="education-grid svelte-lsjtaq"><div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">PTR Coverage Planning</h4> <p class="svelte-lsjtaq">PTR coverage analysis helps identify gaps in reverse DNS configuration. Complete coverage ensures all IPs in
          your network blocks have proper reverse DNS entries for troubleshooting and compliance requirements.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Naming Pattern Validation</h4> <p class="svelte-lsjtaq">Use regex patterns to enforce consistent hostname naming conventions. Patterns like <code class="svelte-lsjtaq">.*\\.corp\\.example\\.com\\.$</code> ensure all PTR records point to properly formatted hostnames within your
          domain structure.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Common PTR Issues</h4> <p class="svelte-lsjtaq">Missing PTRs can cause mail delivery problems and failed reverse lookups. Extra PTRs may indicate outdated
          records or configuration drift. Regular PTR sweeps help maintain DNS hygiene and network documentation
          accuracy.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Remediation Best Practices</h4> <p class="svelte-lsjtaq">Create missing PTRs in batches, verify forward/reverse consistency (A/AAAA records), and establish monitoring
          to detect future gaps. Use descriptive hostnames that include network or service information for easier
          troubleshooting.</p></div></div></div></div>`);
	});
}