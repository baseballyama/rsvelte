import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, compareZones } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

export default function ZoneDiff($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let oldZoneInput = '';
		let newZoneInput = '';
		let results = null;
		let showUnified = false;
		const clipboard = useClipboard();
		let activeExampleIndex = null;

		const examples = [
			{
				name: 'Simple Changes',
				oldZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
example.com.	IN	NS	ns1.example.com.
example.com.	IN	NS	ns2.example.com.
www.example.com.	IN	A	192.0.2.1
mail.example.com.	IN	A	192.0.2.10`,

				newZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010102 3600 1800 1209600 86400
example.com.	IN	NS	ns1.example.com.
example.com.	IN	NS	ns2.example.com.
www.example.com.	IN	A	192.0.2.2
ftp.example.com.	IN	A	192.0.2.3
mail.example.com.	IN	A	192.0.2.10`,
				description: 'Changed IP address and added new record'
			},

			{
				name: 'Record Type Changes',
				oldZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
blog.example.com.	IN	A	192.0.2.2`,

				newZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
blog.example.com.	IN	CNAME	www.example.com.`,
				description: 'Changed A record to CNAME'
			},

			{
				name: 'Complex Migration',
				oldZone: `$ORIGIN example.com.
$TTL 86400
@	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
www	IN	A	192.0.2.1
mail	IN	A	192.0.2.10
	IN	MX	10	mail.example.com.`,

				newZone: `$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. hostmaster.example.com. 2023010201 10800 3600 604800 86400
	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
	IN	NS	ns3.example.com.
www	300	IN	A	203.0.113.1
api	IN	A	203.0.113.2
mail	IN	A	203.0.113.10
	IN	MX	10	mail.example.com.`,
				description: 'Zone migration with IP changes and additions'
			}
		];

		function loadExample(example, index) {
			oldZoneInput = example.oldZone;
			newZoneInput = example.newZone;
			activeExampleIndex = index;
			compareZoneFiles();
		}

		function clearActiveIfChanged() {
			if (activeExampleIndex !== null) {
				const activeExample = examples[activeExampleIndex];

				if (!activeExample || oldZoneInput !== activeExample.oldZone || newZoneInput !== activeExample.newZone) {
					activeExampleIndex = null;
				}
			}
		}

		function compareZoneFiles() {
			if (!oldZoneInput.trim() || !newZoneInput.trim()) {
				results = null;

				return;
			}

			try {
				const oldZone = parseZoneFile(oldZoneInput);
				const newZone = parseZoneFile(newZoneInput);

				results = compareZones(oldZone, newZone);
			} catch(error) {
				console.error('Failed to compare zones:', error);
				results = null;
			}
		}

		function generateUnifiedDiff() {
			if (!results) return '';

			const lines = [];

			lines.push('--- Old Zone');
			lines.push('+++ New Zone');
			lines.push(`@@ -1,${oldZoneInput.split('\n').length} +1,${newZoneInput.split('\n').length} @@`);

			// Show removed records
			for (const record of results.removed) {
				lines.push(`-${formatRecord(record)}`);
			}

			// Show added records
			for (const record of results.added) {
				lines.push(`+${formatRecord(record)}`);
			}

			// Show changed records
			for (const change of results.changed) {
				lines.push(`-${formatRecord(change.before)}`);
				lines.push(`+${formatRecord(change.after)}`);
			}

			return lines.join('\n');
		}

		function formatRecord(record) {
			const ttl = record.ttl ? record.ttl.toString() : '';

			return [record.owner, ttl, record.class, record.type, record.rdata].filter(Boolean).join('\t');
		}

		function copyDiff() {
			if (!results) return;

			const diffText = showUnified ? generateUnifiedDiff() : formatStructuredDiff();

			clipboard.copy(diffText);
		}

		function formatStructuredDiff() {
			if (!results) return '';

			const lines = [];

			if (results.added.length > 0) {
				lines.push(`Added Records (${results.added.length}):`);

				for (const record of results.added) {
					lines.push(`+ ${formatRecord(record)}`);
				}

				lines.push('');
			}

			if (results.removed.length > 0) {
				lines.push(`Removed Records (${results.removed.length}):`);

				for (const record of results.removed) {
					lines.push(`- ${formatRecord(record)}`);
				}

				lines.push('');
			}

			if (results.changed.length > 0) {
				lines.push(`Changed Records (${results.changed.length}):`);

				for (const change of results.changed) {
					lines.push(`~ ${formatRecord(change.before)}`);
					lines.push(`  ${formatRecord(change.after)}`);
				}
			}

			return lines.join('\n');
		}

		function handleInputChange() {
			clearActiveIfChanged();
			compareZoneFiles();
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Zone Diff</h1> <p>Compare two zone files and identify added, removed, and changed DNS records</p></header> <div class="card info-card svelte-ltl2nf"><div class="overview-content svelte-ltl2nf"><div class="overview-item svelte-ltl2nf">`);
		Icon($$renderer, { name: 'plus-circle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-ltl2nf">Added Records:</strong> Identify new DNS records in the updated zone file.</div></div> <div class="overview-item svelte-ltl2nf">`);
		Icon($$renderer, { name: 'minus-circle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-ltl2nf">Removed Records:</strong> Find records that were deleted from the original zone.</div></div> <div class="overview-item svelte-ltl2nf">`);
		Icon($$renderer, { name: 'edit', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-ltl2nf">Changed Records:</strong> Detect modifications to existing records' data or TTL.</div></div></div></div> <div class="card examples-card svelte-ltl2nf"><details class="examples-details svelte-ltl2nf"><summary class="examples-summary svelte-ltl2nf">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-ltl2nf">Zone Comparison Examples</h3></summary> <div class="examples-grid svelte-ltl2nf"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-ltl2nf')}><div class="example-name svelte-ltl2nf">${$.escape(example.name)}</div> <div class="example-description svelte-ltl2nf">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-ltl2nf"><div class="input-layout svelte-ltl2nf"><div class="zone-input-group svelte-ltl2nf"><label for="old-zone" class="svelte-ltl2nf">`);
		Icon($$renderer, { name: 'file', size: 'sm' });
		$$renderer.push(`<!----> Original Zone</label> <textarea id="old-zone" placeholder="Original zone file content..." class="zone-textarea svelte-ltl2nf" rows="10">`);

		const $$body = $.escape(oldZoneInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="zone-input-group svelte-ltl2nf"><label for="new-zone" class="svelte-ltl2nf">`);
		Icon($$renderer, { name: 'file-tick', size: 'sm' });
		$$renderer.push(`<!----> Updated Zone</label> <textarea id="new-zone" placeholder="Updated zone file content..." class="zone-textarea svelte-ltl2nf" rows="10">`);

		const $$body_1 = $.escape(newZoneInput);

		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}

		$$renderer.push(`</textarea></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-ltl2nf"><div class="results-header svelte-ltl2nf"><h3 class="svelte-ltl2nf">Zone Comparison Results</h3> <div class="results-controls svelte-ltl2nf"><label class="diff-format-toggle svelte-ltl2nf"><input type="checkbox" class="styled-checkbox svelte-ltl2nf"${$.attr('checked', showUnified, true)}/> <span class="checkbox-text svelte-ltl2nf">Unified diff format</span></label> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-ltl2nf')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Diff')}</button></div></div> <div class="results-inner svelte-ltl2nf"><div class="summary-card svelte-ltl2nf"><h4 class="svelte-ltl2nf">`);
			Icon($$renderer, { name: 'list-check', size: 'sm' });
			$$renderer.push(`<!----> Change Summary</h4> <div class="summary-stats svelte-ltl2nf"><div class="stat-item added svelte-ltl2nf"><div class="stat-value svelte-ltl2nf">${$.escape(results.added.length)}</div> <div class="stat-label svelte-ltl2nf">Added</div></div> <div class="stat-item removed svelte-ltl2nf"><div class="stat-value svelte-ltl2nf">${$.escape(results.removed.length)}</div> <div class="stat-label svelte-ltl2nf">Removed</div></div> <div class="stat-item changed svelte-ltl2nf"><div class="stat-value svelte-ltl2nf">${$.escape(results.changed.length)}</div> <div class="stat-label svelte-ltl2nf">Changed</div></div> <div class="stat-item unchanged svelte-ltl2nf"><div class="stat-value svelte-ltl2nf">${$.escape(results.unchanged.length)}</div> <div class="stat-label svelte-ltl2nf">Unchanged</div></div></div></div> `);

			if (showUnified) {
				$$renderer.push(`<!--[0--><div class="diff-card unified svelte-ltl2nf"><h4 class="svelte-ltl2nf">`);
				Icon($$renderer, { name: 'code-diff', size: 'sm' });
				$$renderer.push(`<!----> Unified Diff</h4> <div class="code-output svelte-ltl2nf"><pre class="svelte-ltl2nf">${$.escape(generateUnifiedDiff())}</pre></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="diff-sections svelte-ltl2nf">`);

				if (results.added.length > 0) {
					$$renderer.push(`<!--[0--><div class="diff-card added-card svelte-ltl2nf"><h4 class="svelte-ltl2nf">`);
					Icon($$renderer, { name: 'plus-circle', size: 'sm' });
					$$renderer.push(`<!----> Added Records (${$.escape(results.added.length)})</h4> <div class="records-list svelte-ltl2nf"><!--[-->`);

					const each_array_1 = $.ensure_array_like(results.added);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let record = each_array_1[index];

						$$renderer.push(`<div class="record-item added svelte-ltl2nf">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> <code class="svelte-ltl2nf">${$.escape(formatRecord(record))}</code></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.removed.length > 0) {
					$$renderer.push(`<!--[0--><div class="diff-card removed-card svelte-ltl2nf"><h4 class="svelte-ltl2nf">`);
					Icon($$renderer, { name: 'minus-circle', size: 'sm' });
					$$renderer.push(`<!----> Removed Records (${$.escape(results.removed.length)})</h4> <div class="records-list svelte-ltl2nf"><!--[-->`);

					const each_array_2 = $.ensure_array_like(results.removed);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let record = each_array_2[index];

						$$renderer.push(`<div class="record-item removed svelte-ltl2nf">`);
						Icon($$renderer, { name: 'minus', size: 'sm' });
						$$renderer.push(`<!----> <code class="svelte-ltl2nf">${$.escape(formatRecord(record))}</code></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.changed.length > 0) {
					$$renderer.push(`<!--[0--><div class="diff-card changed-card svelte-ltl2nf"><h4 class="svelte-ltl2nf">`);
					Icon($$renderer, { name: 'edit', size: 'sm' });
					$$renderer.push(`<!----> Changed Records (${$.escape(results.changed.length)})</h4> <div class="records-list svelte-ltl2nf"><!--[-->`);

					const each_array_3 = $.ensure_array_like(results.changed);

					for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
						let change = each_array_3[index];

						$$renderer.push(`<div class="change-group svelte-ltl2nf"><div class="record-item removed svelte-ltl2nf">`);
						Icon($$renderer, { name: 'minus', size: 'sm' });
						$$renderer.push(`<!----> <code class="svelte-ltl2nf">${$.escape(formatRecord(change.before))}</code></div> <div class="record-item added svelte-ltl2nf">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> <code class="svelte-ltl2nf">${$.escape(formatRecord(change.after))}</code></div></div>`);
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

		$$renderer.push(`<!--]--> <div class="education-card svelte-ltl2nf"><div class="education-grid svelte-ltl2nf"><div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Zone File Comparison</h4> <p class="svelte-ltl2nf">Comparing zone files helps track DNS changes during migrations, updates, or troubleshooting. It identifies
          exactly what records were added, removed, or modified between two zone versions.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Change Types</h4> <p class="svelte-ltl2nf">Added records are new entries in the updated zone. Removed records exist in the original but not the updated
          zone. Changed records have the same owner and type but different data or TTL values.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Diff Formats</h4> <p class="svelte-ltl2nf">Structured format groups changes by type for easy review. Unified diff format follows standard patch
          conventions, useful for version control systems and automated processing.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Migration Planning</h4> <p class="svelte-ltl2nf">Use zone diffs to plan DNS migrations, verify changes before deployment, and audit modifications. Consider TTL
          impact on propagation when planning record updates or deletions.</p></div></div></div></div>`);
	});
}