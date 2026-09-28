import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';

export default function DNSMXPlanner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let ttl = 3600;

		let mxRecords = [
			{
				id: '1',
				priority: 10,
				mailserver: 'mail1.example.com.',
				ttl: 3600,
				role: 'primary'
			},

			{
				id: '2',
				priority: 20,
				mailserver: 'mail2.example.com.',
				ttl: 3600,
				role: 'backup'
			}
		];

		let autoSort = true;
		let showExamples = false;
		let showGuidance = true;

		// Derived array for display - sorted or original order based on autoSort
		const displayMxRecords = $.derived(() => autoSort
			? [...mxRecords].sort((a, b) => a.priority - b.priority)
			: mxRecords);

		const examples = [
			{
				label: 'Basic Setup',
				domain: 'company.com',
				records: [
					{
						priority: 10,
						mailserver: 'mail.company.com.',
						role: 'primary'
					},

					{
						priority: 20,
						mailserver: 'backup-mail.company.com.',
						role: 'backup'
					}
				]
			},

			{
				label: 'Google Workspace',
				domain: 'company.com',
				records: [
					{
						priority: 1,
						mailserver: 'aspmx.l.google.com.',
						role: 'primary'
					},

					{
						priority: 5,
						mailserver: 'alt1.aspmx.l.google.com.',
						role: 'backup'
					},

					{
						priority: 5,
						mailserver: 'alt2.aspmx.l.google.com.',
						role: 'backup'
					},

					{
						priority: 10,
						mailserver: 'alt3.aspmx.l.google.com.',
						role: 'backup'
					},

					{
						priority: 10,
						mailserver: 'alt4.aspmx.l.google.com.',
						role: 'backup'
					}
				]
			},

			{
				label: 'Microsoft 365',
				domain: 'company.com',
				records: [
					{
						priority: 0,
						mailserver: 'company-com.mail.protection.outlook.com.',
						role: 'primary'
					}
				]
			},

			{
				label: 'Multi-Provider Setup',
				domain: 'company.com',
				records: [
					{
						priority: 10,
						mailserver: 'mail1.provider1.com.',
						role: 'primary'
					},

					{
						priority: 20,
						mailserver: 'mail2.provider1.com.',
						role: 'backup'
					},

					{
						priority: 30,
						mailserver: 'fallback.provider2.com.',
						role: 'backup'
					}
				]
			}
		];

		const priorityGuidelines = [
			{
				range: '0-9',
				usage: 'Highest priority, primary mail servers',
				color: 'success'
			},

			{
				range: '10-19',
				usage: 'High priority, secondary mail servers',
				color: 'info'
			},

			{
				range: '20-49',
				usage: 'Medium priority, backup servers',
				color: 'warning'
			},

			{
				range: '50+',
				usage: 'Low priority, fallback servers',
				color: 'error'
			}
		];

		function addMXRecord() {
			const newId = (Math.max(...mxRecords.map((r) => parseInt(r.id)), 0) + 1).toString();

			mxRecords.push({ id: newId, priority: 30, mailserver: '', ttl, role: 'custom' });
			mxRecords = mxRecords; // Trigger reactivity
		}

		function removeMXRecord(id) {
			mxRecords = mxRecords.filter((r) => r.id !== id);
		}

		function updateRecord(id, field, value) {
			const record = mxRecords.find((r) => r.id === id);

			if (record) {
				record[field] = value;
				mxRecords = mxRecords; // Trigger reactivity
			}
		}

		function loadExample(example) {
			domain = example.domain;

			mxRecords = example.records.map((record, index) => ({
				id: (index + 1).toString(),
				priority: record.priority,
				mailserver: record.mailserver,
				ttl,
				role: record.role
			}));
		}

		function sortRecords() {
			autoSort = !autoSort;
		}

		function validateMXRecord(record) {
			const issues = [];

			if (!record.mailserver.trim()) {
				issues.push('Mail server cannot be empty');
			} else if (!record.mailserver.endsWith('.')) {
				issues.push('Mail server should end with a dot (FQDN)');
			}

			if (record.priority < 0 || record.priority > 65535) {
				issues.push('Priority must be between 0 and 65535');
			}

			// Check for duplicate priorities
			const duplicates = mxRecords.filter((r) => r.id !== record.id && r.priority === record.priority);

			if (duplicates.length > 0) {
				issues.push('Duplicate priority values detected');
			}

			return { valid: issues.length === 0, issues };
		}

		function getPriorityGuideline(priority) {
			if (priority <= 9) return priorityGuidelines[0];
			if (priority <= 19) return priorityGuidelines[1];
			if (priority <= 49) return priorityGuidelines[2];

			return priorityGuidelines[3];
		}

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text);
		}

		function generateZoneFileRecords() {
			// Always sort for zone file output regardless of display preference
			const sortedRecords = [...mxRecords].sort((a, b) => a.priority - b.priority);

			return sortedRecords.map((record) => `${domain}. ${record.ttl} IN MX ${record.priority} ${record.mailserver}`).join('\n');
		}

		$$renderer.push(`<div class="card"><div class="card-header svelte-ocp976"><h1>MX Record Planner</h1> <p class="card-subtitle svelte-ocp976">Plan MX record priorities with fallback guidance, best practices, and sample configurations for popular email
      providers.</p></div> <div class="grid-layout svelte-ocp976"><div class="input-section svelte-ocp976"><div class="domain-config svelte-ocp976"><div class="input-group"><label for="domain">`);

		Icon($$renderer, { name: 'globe', size: 'sm' });

		$$renderer.push(`<!----> Domain</label> <input type="text" id="domain"${$.attr(
			'value',
			// Update TTL for all records when global TTL changes
			// Trigger reactivity
			domain
		)} placeholder="example.com" class="svelte-ocp976"/></div> <div class="input-group"><label for="ttl">`);

		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Default TTL (seconds)</label> <input type="number" id="ttl"${$.attr('value', ttl)} min="60" max="86400" class="svelte-ocp976"/></div> <button class="add-record-btn svelte-ocp976">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Add MX Record</button></div> <div class="mx-records-section svelte-ocp976"><div class="section-header svelte-ocp976"><h3 class="svelte-ocp976">MX Records</h3> <button class="sort-btn svelte-ocp976">`);
		Icon($$renderer, { name: 'sort', size: 'sm' });
		$$renderer.push(`<!----> ${$.escape(autoSort ? 'Original Order' : 'Sort by Priority')}</button></div> <div class="records-list svelte-ocp976"><!--[-->`);

		const each_array = $.ensure_array_like(displayMxRecords());

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let record = each_array[$$index_1];
			const validation = validateMXRecord(record);

			$$renderer.push(`<div${$.attr_class('record-row svelte-ocp976', void 0, { 'error': !validation.valid })}><div class="priority-input"><label${$.attr('for', `priority-${$.stringify(record.id)}`)} class="svelte-ocp976">Priority</label> <input${$.attr('id', `priority-${$.stringify(record.id)}`)} type="number"${$.attr('value', record.priority)} min="0" max="65535" class="svelte-ocp976"/> `);

			if (record.priority !== undefined) {
				$$renderer.push('<!--[0-->');

				const guideline = getPriorityGuideline(record.priority);

				$$renderer.push(`<span${$.attr_class(`priority-hint ${$.stringify(guideline.color)}`, 'svelte-ocp976')}>${$.escape(guideline.usage)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="mailserver-input"><label${$.attr('for', `mailserver-${$.stringify(record.id)}`)} class="svelte-ocp976">Mail Server (FQDN)</label> <input${$.attr('id', `mailserver-${$.stringify(record.id)}`)} type="text"${$.attr('value', record.mailserver)} placeholder="mail.example.com." class="svelte-ocp976"/></div> <div class="role-select"><label${$.attr('for', `role-${$.stringify(record.id)}`)} class="svelte-ocp976">Role</label> `);

			$$renderer.select(
				{
					id: `role-${$.stringify(record.id)}`,
					value: record.role,
					onchange: (e) => updateRecord(record.id, 'role', e.target.value),
					class: ''
				},
				($$renderer) => {
					$$renderer.option({ value: 'primary' }, ($$renderer) => {
						$$renderer.push(`Primary`);
					});

					$$renderer.option({ value: 'backup' }, ($$renderer) => {
						$$renderer.push(`Backup`);
					});

					$$renderer.option({ value: 'custom' }, ($$renderer) => {
						$$renderer.push(`Custom`);
					});
				},
				'svelte-ocp976'
			);

			$$renderer.push(`</div> <button class="remove-btn svelte-ocp976">`);
			Icon($$renderer, { name: 'trash', size: 'sm' });
			$$renderer.push(`<!----></button> `);

			if (!validation.valid) {
				$$renderer.push(`<!--[0--><div class="validation-errors svelte-ocp976"><!--[-->`);

				const each_array_1 = $.ensure_array_like(validation.issues);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let issue = each_array_1[index];

					$$renderer.push(`<div class="error-message svelte-ocp976">`);
					Icon($$renderer, { name: 'alert-circle', size: 'xs' });
					$$renderer.push(`<!----> ${$.escape(issue)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="examples-section svelte-ocp976"><details class="examples-toggle svelte-ocp976"${$.attr('open', showExamples, true)}><summary class="svelte-ocp976">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Quick Examples</summary> <div class="examples-grid svelte-ocp976"><!--[-->`);

		const each_array_2 = $.ensure_array_like(examples);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let example = each_array_2[$$index_2];

			$$renderer.push(`<button class="example-card svelte-ocp976"><h4 class="svelte-ocp976">${$.escape(example.label)}</h4> <p class="svelte-ocp976">${$.escape(example.records.length)} MX records</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details> <details class="guidance-toggle svelte-ocp976"${$.attr('open', showGuidance, true)}><summary class="svelte-ocp976">`);
		Icon($$renderer, { name: 'info', size: 'sm' });
		$$renderer.push(`<!----> Priority Guidelines</summary> <div class="priority-guide svelte-ocp976"><!--[-->`);

		const each_array_3 = $.ensure_array_like(priorityGuidelines);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let guideline = each_array_3[$$index_3];

			$$renderer.push(`<div${$.attr_class(`guide-item ${$.stringify(guideline.color)}`, 'svelte-ocp976')}><span class="range svelte-ocp976">${$.escape(guideline.range)}</span> <span class="usage">${$.escape(guideline.usage)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></details> <div class="info-panel svelte-ocp976"><h4 class="svelte-ocp976">MX Best Practices</h4> <ul class="svelte-ocp976"><li class="svelte-ocp976">Always have at least two MX records for redundancy</li> <li class="svelte-ocp976">Use different priority values to control mail flow</li> <li class="svelte-ocp976">Ensure all mail servers are properly configured</li> <li class="svelte-ocp976">Test mail delivery to all configured servers</li> <li class="svelte-ocp976">Consider geographic distribution for better performance</li></ul></div></div></div> `);

		if (mxRecords.length > 0) {
			$$renderer.push(`<!--[0--><div class="results-section svelte-ocp976"><div class="results-header svelte-ocp976"><h2 class="svelte-ocp976">Generated MX Records</h2> <div class="export-buttons svelte-ocp976"><button class="svelte-ocp976">`);
			Icon($$renderer, { name: 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy Zone Records</button></div></div> <div class="records-table svelte-ocp976"><div class="table-header svelte-ocp976"><div class="svelte-ocp976">Domain</div> <div class="svelte-ocp976">TTL</div> <div class="svelte-ocp976">Type</div> <div class="svelte-ocp976">Priority</div> <div class="svelte-ocp976">Mail Server</div> <div class="svelte-ocp976">Status</div></div> <!--[-->`);

			const each_array_4 = $.ensure_array_like(displayMxRecords());

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let record = each_array_4[$$index_4];
				const validation = validateMXRecord(record);

				$$renderer.push(`<div${$.attr_class('table-row svelte-ocp976', void 0, { 'error': !validation.valid })}><div class="domain svelte-ocp976">${$.escape(domain)}</div> <div class="ttl svelte-ocp976">${$.escape(record.ttl)}</div> <div class="type svelte-ocp976"><span class="record-type svelte-ocp976">MX</span></div> <div class="priority svelte-ocp976"><span${$.attr_class(`priority-badge ${$.stringify(getPriorityGuideline(record.priority).color)}`, 'svelte-ocp976')}>${$.escape(record.priority)}</span></div> <div class="mailserver svelte-ocp976">${$.escape(record.mailserver)}</div> <div class="status svelte-ocp976"><span${$.attr_class(`status-badge ${validation.valid ? 'success' : 'error'}`, 'svelte-ocp976')}>`);

				Icon($$renderer, {
					name: validation.valid ? 'check-circle' : 'x-circle',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(validation.valid ? 'Valid' : 'Issues')}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (mxRecords.some((r) => !validateMXRecord(r).valid)) {
				$$renderer.push(`<!--[0--><div class="validation-summary svelte-ocp976"><h3 class="svelte-ocp976">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Configuration Issues</h3> <ul class="svelte-ocp976"><!--[-->`);

				const each_array_5 = $.ensure_array_like(mxRecords.filter((r) => !validateMXRecord(r).valid));

				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let record = each_array_5[$$index_5];
					const validation = validateMXRecord(record);

					$$renderer.push(`<li class="svelte-ocp976"><strong>Priority ${$.escape(record.priority)}</strong>: ${$.escape(validation.issues.join(', '))}</li>`);
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