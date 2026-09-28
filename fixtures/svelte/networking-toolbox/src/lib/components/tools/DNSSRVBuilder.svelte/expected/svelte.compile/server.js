import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';

export default function DNSSRVBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ttl = 3600;

		let srvRecords = [
			{
				id: '1',
				service: '_http',
				protocol: 'tcp',
				name: 'example.com',
				priority: 10,
				weight: 5,
				port: 80,
				target: 'web1.example.com.',
				ttl: 3600
			}
		];

		let showExamples = false;

		const examples = [
			{
				label: 'Web Services',
				records: [
					{
						service: '_http',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 80,
						target: 'web1.example.com.'
					},

					{
						service: '_https',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 443,
						target: 'web1.example.com.'
					},

					{
						service: '_http',
						protocol: 'tcp',
						priority: 20,
						weight: 5,
						port: 8080,
						target: 'web2.example.com.'
					}
				]
			},

			{
				label: 'Mail Services',
				records: [
					{
						service: '_smtp',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 25,
						target: 'mail1.example.com.'
					},

					{
						service: '_submission',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 587,
						target: 'mail1.example.com.'
					},

					{
						service: '_imaps',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 993,
						target: 'mail1.example.com.'
					}
				]
			},

			{
				label: 'SIP Services',
				records: [
					{
						service: '_sip',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 5060,
						target: 'sip1.example.com.'
					},

					{
						service: '_sip',
						protocol: 'udp',
						priority: 10,
						weight: 5,
						port: 5060,
						target: 'sip1.example.com.'
					},

					{
						service: '_sips',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 5061,
						target: 'sip1.example.com.'
					}
				]
			},

			{
				label: 'XMPP Services',
				records: [
					{
						service: '_xmpp-server',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 5269,
						target: 'xmpp.example.com.'
					},

					{
						service: '_xmpp-client',
						protocol: 'tcp',
						priority: 10,
						weight: 5,
						port: 5222,
						target: 'xmpp.example.com.'
					}
				]
			}
		];

		const commonServices = [
			{ service: '_http', port: 80, protocol: 'tcp' },
			{ service: '_https', port: 443, protocol: 'tcp' },
			{ service: '_ftp', port: 21, protocol: 'tcp' },
			{ service: '_smtp', port: 25, protocol: 'tcp' },
			{ service: '_submission', port: 587, protocol: 'tcp' },
			{ service: '_imap', port: 143, protocol: 'tcp' },
			{ service: '_imaps', port: 993, protocol: 'tcp' },
			{ service: '_pop3', port: 110, protocol: 'tcp' },
			{ service: '_pop3s', port: 995, protocol: 'tcp' },
			{ service: '_sip', port: 5060, protocol: 'tcp' },
			{ service: '_sips', port: 5061, protocol: 'tcp' },
			{ service: '_xmpp-server', port: 5269, protocol: 'tcp' },
			{ service: '_xmpp-client', port: 5222, protocol: 'tcp' },
			{ service: '_ldap', port: 389, protocol: 'tcp' },
			{ service: '_ldaps', port: 636, protocol: 'tcp' }
		];

		function addSRVRecord() {
			const newId = (Math.max(...srvRecords.map((r) => parseInt(r.id)), 0) + 1).toString();

			srvRecords.push({
				id: newId,
				service: '_http',
				protocol: 'tcp',
				name: 'example.com',
				priority: 10,
				weight: 5,
				port: 80,
				target: 'server.example.com.',
				ttl
			});

			srvRecords = srvRecords;
		}

		function removeSRVRecord(id) {
			srvRecords = srvRecords.filter((r) => r.id !== id);
		}

		function updateRecord(id, field, value) {
			const record = srvRecords.find((r) => r.id === id);

			if (record) {
				record[field] = value;
				srvRecords = srvRecords;
			}
		}

		function loadExample(example) {
			srvRecords = example.records.map((record, index) => ({
				id: (index + 1).toString(),
				service: record.service,
				protocol: record.protocol,
				name: 'example.com',
				priority: record.priority,
				weight: record.weight,
				port: record.port,
				target: record.target,
				ttl
			}));
		}

		function fillCommonService(recordId, serviceName) {
			const service = commonServices.find((s) => s.service === serviceName);

			if (service) {
				updateRecord(recordId, 'service', service.service);
				updateRecord(recordId, 'protocol', service.protocol);
				updateRecord(recordId, 'port', service.port);
			}
		}

		function validateSRVRecord(record) {
			const issues = [];

			if (!record.service.trim()) {
				issues.push('Service name cannot be empty');
			} else if (!record.service.startsWith('_')) {
				issues.push('Service name must start with underscore (_)');
			}

			if (!record.name.trim()) {
				issues.push('Domain name cannot be empty');
			}

			if (record.priority < 0 || record.priority > 65535) {
				issues.push('Priority must be between 0 and 65535');
			}

			if (record.weight < 0 || record.weight > 65535) {
				issues.push('Weight must be between 0 and 65535');
			}

			if (record.port < 1 || record.port > 65535) {
				issues.push('Port must be between 1 and 65535');
			}

			if (!record.target.trim()) {
				issues.push('Target cannot be empty');
			} else if (!record.target.endsWith('.')) {
				issues.push('Target should end with a dot (FQDN)');
			}

			return { valid: issues.length === 0, issues };
		}

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text);
		}

		function generateSRVRecords() {
			return srvRecords.map((record) => {
				const srvName = `${record.service}.${record.protocol}.${record.name}`;

				return `${srvName} ${record.ttl} IN SRV ${record.priority} ${record.weight} ${record.port} ${record.target}`;
			}).join('\n');
		}

		$$renderer.push(`<div class="card"><div class="card-header svelte-rfxrrf"><h1>SRV Record Builder</h1> <p class="card-subtitle svelte-rfxrrf">Compose SRV records with service discovery, protocol specification, priority/weight balancing, and target
      validation.</p></div> <div class="grid-layout svelte-rfxrrf"><div class="input-section svelte-rfxrrf"><div class="controls-header svelte-rfxrrf"><div class="input-group"><label for="ttl">`);

		Icon($$renderer, { name: 'clock', size: 'sm' });

		$$renderer.push(`<!----> Default TTL (seconds)</label> <input type="number" id="ttl"${$.attr(
			'value',
			// Update TTL for all records when global TTL changes
			ttl
		)} min="60" max="86400" class="svelte-rfxrrf"/></div> <button class="add-record-btn svelte-rfxrrf">`);

		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Add SRV Record</button></div> <div class="srv-records-section svelte-rfxrrf"><div class="section-header svelte-rfxrrf"><h3 class="svelte-rfxrrf">SRV Records</h3></div> <div class="records-list svelte-rfxrrf"><!--[-->`);

		const each_array = $.ensure_array_like(srvRecords);

		for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
			let record = each_array[$$index_2];
			const validation = validateSRVRecord(record);

			$$renderer.push(`<div${$.attr_class('record-row svelte-rfxrrf', void 0, { 'error': !validation.valid })}><div class="record-fields svelte-rfxrrf"><div class="service-protocol-row svelte-rfxrrf"><div class="service-input"><label${$.attr('for', `service-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Service</label> <div class="service-select-wrapper svelte-rfxrrf">`);

			$$renderer.select(
				{
					id: `service-${$.stringify(record.id)}`,
					value: record.service,
					onchange: (e) => {
						const serviceName = e.target.value;

						updateRecord(record.id, 'service', serviceName);

						if (serviceName !== 'custom') {
							fillCommonService(record.id, serviceName);
						}
					},
					class: ''
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(commonServices);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let service = each_array_1[$$index];

						$$renderer.option({ value: service.service }, ($$renderer) => {
							$$renderer.push(`${$.escape(service.service)}`);
						});
					}

					$$renderer.push(`<!--]-->`);

					$$renderer.option({ value: 'custom' }, ($$renderer) => {
						$$renderer.push(`Custom`);
					});
				},
				'svelte-rfxrrf'
			);

			$$renderer.push(` `);

			if (record.service === 'custom') {
				$$renderer.push(`<!--[0--><input type="text"${$.attr('value', record.service)} placeholder="_myservice" class="custom-service-input svelte-rfxrrf"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="protocol-input"><label${$.attr('for', `protocol-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Protocol</label> `);

			$$renderer.select(
				{
					id: `protocol-${$.stringify(record.id)}`,
					value: record.protocol,
					onchange: (e) => updateRecord(record.id, 'protocol', e.target.value),
					class: ''
				},
				($$renderer) => {
					$$renderer.option({ value: 'tcp' }, ($$renderer) => {
						$$renderer.push(`TCP`);
					});

					$$renderer.option({ value: 'udp' }, ($$renderer) => {
						$$renderer.push(`UDP`);
					});

					$$renderer.option({ value: 'tls' }, ($$renderer) => {
						$$renderer.push(`TLS`);
					});

					$$renderer.option({ value: 'sctp' }, ($$renderer) => {
						$$renderer.push(`SCTP`);
					});
				},
				'svelte-rfxrrf'
			);

			$$renderer.push(`</div> <div class="name-input"><label${$.attr('for', `domain-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Domain</label> <input${$.attr('id', `domain-${$.stringify(record.id)}`)} type="text"${$.attr('value', record.name)} placeholder="example.com" class="svelte-rfxrrf"/></div></div> <div class="priority-weight-row svelte-rfxrrf"><div class="priority-input"><label${$.attr('for', `priority-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Priority</label> <input${$.attr('id', `priority-${$.stringify(record.id)}`)} type="number"${$.attr('value', record.priority)} min="0" max="65535" class="svelte-rfxrrf"/></div> <div class="weight-input"><label${$.attr('for', `weight-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Weight</label> <input${$.attr('id', `weight-${$.stringify(record.id)}`)} type="number"${$.attr('value', record.weight)} min="0" max="65535" class="svelte-rfxrrf"/></div> <div class="port-input"><label${$.attr('for', `port-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Port</label> <input${$.attr('id', `port-${$.stringify(record.id)}`)} type="number"${$.attr('value', record.port)} min="1" max="65535" class="svelte-rfxrrf"/></div> <div class="target-input"><label${$.attr('for', `target-${$.stringify(record.id)}`)} class="svelte-rfxrrf">Target (FQDN)</label> <input${$.attr('id', `target-${$.stringify(record.id)}`)} type="text"${$.attr('value', record.target)} placeholder="server.example.com." class="svelte-rfxrrf"/></div></div></div> <button class="remove-btn svelte-rfxrrf">`);
			Icon($$renderer, { name: 'trash', size: 'sm' });
			$$renderer.push(`<!----></button> `);

			if (!validation.valid) {
				$$renderer.push(`<!--[0--><div class="validation-errors svelte-rfxrrf"><!--[-->`);

				const each_array_2 = $.ensure_array_like(validation.issues);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let issue = each_array_2[index];

					$$renderer.push(`<div class="error-message svelte-rfxrrf">`);
					Icon($$renderer, { name: 'alert-circle', size: 'xs' });
					$$renderer.push(`<!----> ${$.escape(issue)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="examples-section svelte-rfxrrf"><details class="examples-toggle svelte-rfxrrf"${$.attr('open', showExamples, true)}><summary class="svelte-rfxrrf">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Service Examples</summary> <div class="examples-grid svelte-rfxrrf"><!--[-->`);

		const each_array_3 = $.ensure_array_like(examples);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let example = each_array_3[$$index_3];

			$$renderer.push(`<button class="example-card svelte-rfxrrf"><h4 class="svelte-rfxrrf">${$.escape(example.label)}</h4> <p class="svelte-rfxrrf">${$.escape(example.records.length)} SRV records</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details> <div class="info-panel svelte-rfxrrf"><h4 class="svelte-rfxrrf">SRV Record Structure</h4> <div class="srv-format svelte-rfxrrf"><code class="svelte-rfxrrf">_service._protocol.domain. TTL IN SRV priority weight port target.</code></div> <ul class="svelte-rfxrrf"><li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Service:</strong> Must start with underscore (e.g., _http, _sip)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Protocol:</strong> Usually tcp, udp, tls, or sctp</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Priority:</strong> Lower values = higher priority (0-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Weight:</strong> Load balancing within same priority (0-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Port:</strong> Service port number (1-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Target:</strong> FQDN of the server (must end with dot)</li></ul></div></div></div> `);

		if (srvRecords.length > 0) {
			$$renderer.push(`<!--[0--><div class="results-section svelte-rfxrrf"><div class="results-header svelte-rfxrrf"><h2 class="svelte-rfxrrf">Generated SRV Records</h2> <div class="export-buttons svelte-rfxrrf"><button class="svelte-rfxrrf">`);
			Icon($$renderer, { name: 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy Records</button></div></div> <div class="records-table svelte-rfxrrf"><div class="table-header svelte-rfxrrf"><div class="svelte-rfxrrf">Service</div> <div class="svelte-rfxrrf">TTL</div> <div class="svelte-rfxrrf">Type</div> <div class="svelte-rfxrrf">Priority</div> <div class="svelte-rfxrrf">Weight</div> <div class="svelte-rfxrrf">Port</div> <div class="svelte-rfxrrf">Target</div> <div class="svelte-rfxrrf">Status</div></div> <!--[-->`);

			const each_array_4 = $.ensure_array_like(srvRecords);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let record = each_array_4[$$index_4];
				const validation = validateSRVRecord(record);

				$$renderer.push(`<div${$.attr_class('table-row svelte-rfxrrf', void 0, { 'error': !validation.valid })}><div class="service-name svelte-rfxrrf">${$.escape(record.service)}.${$.escape(record.protocol)}.${$.escape(record.name)}</div> <div class="ttl svelte-rfxrrf">${$.escape(record.ttl)}</div> <div class="type svelte-rfxrrf"><span class="record-type svelte-rfxrrf">SRV</span></div> <div class="priority svelte-rfxrrf">${$.escape(record.priority)}</div> <div class="weight svelte-rfxrrf">${$.escape(record.weight)}</div> <div class="port svelte-rfxrrf">${$.escape(record.port)}</div> <div class="target svelte-rfxrrf">${$.escape(record.target)}</div> <div class="status svelte-rfxrrf"><span${$.attr_class(`status-badge ${validation.valid ? 'success' : 'error'}`, 'svelte-rfxrrf')}>`);

				Icon($$renderer, {
					name: validation.valid ? 'check-circle' : 'x-circle',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(validation.valid ? 'Valid' : 'Issues')}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (srvRecords.some((r) => !validateSRVRecord(r).valid)) {
				$$renderer.push(`<!--[0--><div class="validation-summary svelte-rfxrrf"><h3 class="svelte-rfxrrf">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Configuration Issues</h3> <ul class="svelte-rfxrrf"><!--[-->`);

				const each_array_5 = $.ensure_array_like(srvRecords.filter((r) => !validateSRVRecord(r).valid));

				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let record = each_array_5[$$index_5];
					const validation = validateSRVRecord(record);

					$$renderer.push(`<li class="svelte-rfxrrf"><strong>${$.escape(record.service)}.${$.escape(record.protocol)}.${$.escape(record.name)}</strong>: ${$.escape(validation.issues.join(', '))}</li>`);
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