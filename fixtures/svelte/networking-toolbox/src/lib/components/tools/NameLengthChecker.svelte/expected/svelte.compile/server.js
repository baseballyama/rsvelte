import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, checkNameLengths } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

export default function NameLengthChecker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let zoneInput = '';
		let results = null;
		const clipboard = useClipboard();
		let activeExampleIndex = null;

		const examples = [
			{
				name: 'Valid Names',
				content: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
mail.example.com.	IN	A	192.0.2.10
blog.example.com.	IN	CNAME	www.example.com.`,
				description: 'Zone with all names within DNS limits'
			},

			{
				name: 'Long Labels',
				content: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
this-is-a-very-long-subdomain-name-that-exceeds-the-sixty-three-character-label-limit.example.com.	IN	A	192.0.2.1
another-extremely-long-label-name-that-is-definitely-over-the-limit.example.com.	IN	A	192.0.2.2`,
				description: 'Zone with labels exceeding 63-character limit'
			},

			{
				name: 'Very Long FQDN',
				content: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
this.is.a.very.deep.subdomain.structure.with.many.labels.that.together.create.a.fully.qualified.domain.name.that.might.exceed.the.maximum.allowed.length.of.two.hundred.fifty.five.characters.which.could.cause.issues.in.dns.resolution.and.should.be.avoided.example.com.	IN	A	192.0.2.1`,
				description: 'Zone with FQDN exceeding 255-character limit'
			},

			{
				name: 'Mixed Issues',
				content: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
this-label-is-exactly-sixty-three-characters-long-and-should-be-valid-ok.example.com.	IN	A	192.0.2.2
this-label-is-definitely-over-sixty-three-characters-and-will-cause-a-violation.example.com.	IN	A	192.0.2.3
very.deep.nested.subdomain.with.lots.of.labels.creating.a.domain.name.that.is.extremely.long.and.definitely.over.the.limit.of.two.hundred.fifty.five.characters.which.makes.it.invalid.according.to.dns.specifications.example.com.	IN	CNAME	www.example.com.`,
				description: 'Mix of valid names and various violations'
			}
		];

		function loadExample(example, index) {
			zoneInput = example.content;
			activeExampleIndex = index;
			checkNames();
		}

		function clearActiveIfChanged() {
			if (activeExampleIndex !== null) {
				const activeExample = examples[activeExampleIndex];

				if (!activeExample || zoneInput !== activeExample.content) {
					activeExampleIndex = null;
				}
			}
		}

		function checkNames() {
			if (!zoneInput.trim()) {
				results = null;

				return;
			}

			try {
				const parsed = parseZoneFile(zoneInput);
				const violations = checkNameLengths(parsed);

				// Count unique names
				const uniqueNames = new Set(parsed.records.map((r) => r.owner));

				results = {
					violations,
					totalNames: uniqueNames.size,
					validNames: uniqueNames.size - new Set(violations.map((v) => v.name)).size
				};
			} catch(error) {
				console.error('Failed to check names:', error);
				results = null;
			}
		}

		function copyResults() {
			if (!results) return;

			const reportText = formatReportForCopy(results);

			clipboard.copy(reportText);
		}

		function formatReportForCopy(data) {
			if (!data) return '';

			const lines = [];

			lines.push(`DNS Name Length Validation Report`);
			lines.push(`===============================\n`);
			lines.push(`Total Names Checked: ${data.totalNames}`);
			lines.push(`Valid Names: ${data.validNames}`);
			lines.push(`Names with Violations: ${data.violations.length}\n`);

			if (data.violations.length > 0) {
				lines.push(`Violations Found:`);
				lines.push(`-----------------`);

				const labelViolations = data.violations.filter((v) => v.type === 'label');
				const fqdnViolations = data.violations.filter((v) => v.type === 'fqdn');

				if (labelViolations.length > 0) {
					lines.push(`\nLabel Length Violations (${labelViolations.length}):`);

					for (const violation of labelViolations) {
						lines.push(`  ${violation.name} - ${violation.length} characters (limit: ${violation.limit})`);
					}
				}

				if (fqdnViolations.length > 0) {
					lines.push(`\nFQDN Length Violations (${fqdnViolations.length}):`);

					for (const violation of fqdnViolations) {
						lines.push(`  ${violation.name} - ${violation.length} characters (limit: ${violation.limit})`);
					}
				}
			} else {
				lines.push(`All names are within DNS length limits! ✓`);
			}

			return lines.join('\n');
		}

		function handleInputChange() {
			clearActiveIfChanged();
			checkNames();
		}

		function getViolationSeverity(violation) {
			const excess = violation.length - violation.limit;

			if (excess > 50) return 'severe';
			if (excess > 20) return 'high';
			if (excess > 10) return 'medium';

			return 'low';
		}

		function getViolationColor(violation) {
			const severity = getViolationSeverity(violation);

			switch (severity) {
				case 'severe':
					return 'var(--color-error)';

				case 'high':
					return 'var(--color-error)';

				case 'medium':
					return 'var(--color-warning)';

				case 'low':
					return 'var(--color-warning)';

				default:
					return 'var(--color-warning)';
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Name Length Checker</h1> <p>Validate DNS names against RFC length limits: 63 bytes per label, 255 bytes per FQDN</p></header> <div class="card info-card svelte-1tr73eu"><div class="overview-content svelte-1tr73eu"><div class="overview-item svelte-1tr73eu">`);
		Icon($$renderer, { name: 'ruler', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1tr73eu">Label Limits:</strong> Each DNS label must be 63 characters or fewer.</div></div> <div class="overview-item svelte-1tr73eu">`);
		Icon($$renderer, { name: 'maximize', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1tr73eu">FQDN Limits:</strong> Complete domain names must be 255 characters or fewer.</div></div> <div class="overview-item svelte-1tr73eu">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1tr73eu">Compliance:</strong> Exceeding limits causes DNS resolution failures.</div></div></div></div> <div class="card examples-card svelte-1tr73eu"><details class="examples-details svelte-1tr73eu"><summary class="examples-summary svelte-1tr73eu">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-1tr73eu">Name Length Examples</h3></summary> <div class="examples-grid svelte-1tr73eu"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-1tr73eu')}><div class="example-name svelte-1tr73eu">${$.escape(example.name)}</div> <div class="example-description svelte-1tr73eu">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-1tr73eu"><div class="input-group svelte-1tr73eu"><label for="zone-input" class="svelte-1tr73eu">`);
		Icon($$renderer, { name: 'file', size: 'sm' });

		$$renderer.push(`<!----> Zone File Content</label> <textarea id="zone-input" placeholder="example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
very-long-subdomain-name.example.com.	IN	A	192.0.2.2" class="zone-textarea svelte-1tr73eu" rows="10">`);

		const $$body = $.escape(zoneInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-1tr73eu"><div class="results-header svelte-1tr73eu"><h3 class="svelte-1tr73eu">Name Length Validation Results</h3> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-1tr73eu')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Report')}</button></div> <div class="results-inner svelte-1tr73eu"><div class="summary-card svelte-1tr73eu"><div class="summary-stats svelte-1tr73eu"><div class="stat-item total svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu">`);
			Icon($$renderer, { name: 'hash', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu">${$.escape(results.totalNames)}</div> <div class="stat-label svelte-1tr73eu">Total Names</div></div></div> <div class="stat-item valid svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu">`);
			Icon($$renderer, { name: 'check-circle', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu">${$.escape(results.validNames)}</div> <div class="stat-label svelte-1tr73eu">Valid Names</div></div></div> <div class="stat-item violations svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu">${$.escape(results.violations.length)}</div> <div class="stat-label svelte-1tr73eu">Violations</div></div></div> <div class="stat-item compliance svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu">`);

			Icon($$renderer, {
				name: results.violations.length === 0 ? 'shield-check' : 'shield-alert',
				size: 'lg'
			});

			$$renderer.push(`<!----></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu">${$.escape(results.violations.length === 0
				? '100%'
				: `${(results.validNames / results.totalNames * 100).toFixed(1)}%`)}</div> <div class="stat-label svelte-1tr73eu">Compliance</div></div></div></div></div> `);

			if (results.violations.length === 0) {
				$$renderer.push(`<!--[0--><div class="success-card svelte-1tr73eu"><div class="success-content svelte-1tr73eu">`);
				Icon($$renderer, { name: 'check-circle', size: 'lg' });
				$$renderer.push(`<!----> <div class="success-message svelte-1tr73eu"><h4 class="svelte-1tr73eu">All Names Valid!</h4> <p class="svelte-1tr73eu">All ${$.escape(results.totalNames)} domain names in your zone comply with DNS length limits.</p></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="violations-section svelte-1tr73eu"><h4 class="svelte-1tr73eu">Length Limit Violations</h4> `);

				if (results.violations.filter((v) => v.type === 'label').length > 0) {
					$$renderer.push(`<!--[0--><div class="violation-category svelte-1tr73eu"><h5 class="svelte-1tr73eu">`);
					Icon($$renderer, { name: 'tag', size: 'sm' });
					$$renderer.push(`<!----> Label Length Violations (${$.escape(results.violations.filter((v) => v.type === 'label').length)})</h5> <div class="violations-list svelte-1tr73eu"><!--[-->`);

					const each_array_1 = $.ensure_array_like(results.violations.filter((v) => v.type === 'label'));

					for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
						let violation = each_array_1[$$index_2];

						$$renderer.push(`<div class="violation-item svelte-1tr73eu"${$.attr_style(`border-left-color: ${$.stringify(getViolationColor(violation))}`)}><div class="violation-header svelte-1tr73eu"><div class="violation-name svelte-1tr73eu">${$.escape(violation.name)}</div> <div class="violation-stats svelte-1tr73eu"><span class="violation-length svelte-1tr73eu"${$.attr_style(`color: ${$.stringify(getViolationColor(violation))}`)}>${$.escape(violation.length)} chars</span> <span class="violation-limit svelte-1tr73eu">(limit: ${$.escape(violation.limit)})</span> <span class="violation-excess svelte-1tr73eu">+${$.escape(violation.length - violation.limit)} over</span></div></div> `);

						if (violation.labels) {
							$$renderer.push(`<!--[0--><div class="violation-labels svelte-1tr73eu"><strong class="svelte-1tr73eu">Labels:</strong> <!--[-->`);

							const each_array_2 = $.ensure_array_like(violation.labels);

							for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
								let label = each_array_2[index];

								$$renderer.push(`<span${$.attr_class(`label-item ${label.length > 63 ? 'invalid' : 'valid'}`, 'svelte-1tr73eu')}>${$.escape(label)} <span class="label-length svelte-1tr73eu">(${$.escape(label.length)})</span></span> `);

								if (index < violation.labels.length - 1) {
									$$renderer.push(`<!--[0-->•`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.violations.filter((v) => v.type === 'fqdn').length > 0) {
					$$renderer.push(`<!--[0--><div class="violation-category svelte-1tr73eu"><h5 class="svelte-1tr73eu">`);
					Icon($$renderer, { name: 'globe', size: 'sm' });
					$$renderer.push(`<!----> FQDN Length Violations (${$.escape(results.violations.filter((v) => v.type === 'fqdn').length)})</h5> <div class="violations-list svelte-1tr73eu"><!--[-->`);

					const each_array_3 = $.ensure_array_like(results.violations.filter((v) => v.type === 'fqdn'));

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let violation = each_array_3[$$index_3];

						$$renderer.push(`<div class="violation-item svelte-1tr73eu"${$.attr_style(`border-left-color: ${$.stringify(getViolationColor(violation))}`)}><div class="violation-header svelte-1tr73eu"><div class="violation-name svelte-1tr73eu">${$.escape(violation.name)}</div> <div class="violation-stats svelte-1tr73eu"><span class="violation-length svelte-1tr73eu"${$.attr_style(`color: ${$.stringify(getViolationColor(violation))}`)}>${$.escape(violation.length)} chars</span> <span class="violation-limit svelte-1tr73eu">(limit: ${$.escape(violation.limit)})</span> <span class="violation-excess svelte-1tr73eu">+${$.escape(violation.length - violation.limit)} over</span></div></div></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1tr73eu"><div class="education-grid svelte-1tr73eu"><div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">DNS Name Limits</h4> <p class="svelte-1tr73eu">DNS names have strict length limits defined by RFC specifications. Each label (part between dots) must be 63
          octets or less, and the complete FQDN must not exceed 255 octets including the length encoding.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Impact of Violations</h4> <p class="svelte-1tr73eu">Names exceeding these limits will cause DNS resolution failures. Some resolvers may truncate names, while
          others will reject them entirely. This can break applications and services relying on these names.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Common Causes</h4> <p class="svelte-1tr73eu">Long names often result from deep subdomain structures, verbose naming conventions, or automated name
          generation. Consider shorter alternatives or restructuring your DNS hierarchy to stay within limits.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Best Practices</h4> <p class="svelte-1tr73eu">Use concise, descriptive names. Avoid unnecessary subdomains and overly verbose labels. Regularly validate
          zone files during development. Consider using aliases or redirects for shorter public-facing names.</p></div></div></div></div>`);
	});
}