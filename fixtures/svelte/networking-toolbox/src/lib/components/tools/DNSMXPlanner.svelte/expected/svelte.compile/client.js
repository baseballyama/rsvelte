import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div class="error-message svelte-ocp976"><!> </div>`);
var root_2 = $.from_html(`<div class="validation-errors svelte-ocp976"></div>`);
var root_3 = $.from_html(`<div><div class="priority-input"><label class="svelte-ocp976">Priority</label> <input type="number" min="0" max="65535" class="svelte-ocp976"/> <!></div> <div class="mailserver-input"><label class="svelte-ocp976">Mail Server (FQDN)</label> <input type="text" placeholder="mail.example.com." class="svelte-ocp976"/></div> <div class="role-select"><label class="svelte-ocp976">Role</label> <select class="svelte-ocp976"><option>Primary</option><option>Backup</option><option>Custom</option></select></div> <button class="remove-btn svelte-ocp976"><!></button> <!></div>`);
var root_4 = $.from_html(`<button class="example-card svelte-ocp976"><h4 class="svelte-ocp976"> </h4> <p class="svelte-ocp976"> </p></button>`);
var root_5 = $.from_html(`<div><span class="range svelte-ocp976"> </span> <span class="usage"> </span></div>`);
var root_6 = $.from_html(`<div><div class="domain svelte-ocp976"> </div> <div class="ttl svelte-ocp976"> </div> <div class="type svelte-ocp976"><span class="record-type svelte-ocp976">MX</span></div> <div class="priority svelte-ocp976"><span> </span></div> <div class="mailserver svelte-ocp976"> </div> <div class="status svelte-ocp976"><span><!> </span></div></div>`);
var root_7 = $.from_html(`<li class="svelte-ocp976"><strong> </strong> </li>`);
var root_8 = $.from_html(`<div class="validation-summary svelte-ocp976"><h3 class="svelte-ocp976"><!> Configuration Issues</h3> <ul class="svelte-ocp976"></ul></div>`);
var root_9 = $.from_html(`<div class="results-section svelte-ocp976"><div class="results-header svelte-ocp976"><h2 class="svelte-ocp976">Generated MX Records</h2> <div class="export-buttons svelte-ocp976"><button class="svelte-ocp976"><!> Copy Zone Records</button></div></div> <div class="records-table svelte-ocp976"><div class="table-header svelte-ocp976"><div class="svelte-ocp976">Domain</div> <div class="svelte-ocp976">TTL</div> <div class="svelte-ocp976">Type</div> <div class="svelte-ocp976">Priority</div> <div class="svelte-ocp976">Mail Server</div> <div class="svelte-ocp976">Status</div></div> <!></div> <!></div>`);

var root_10 = $.from_html(`<div class="card"><div class="card-header svelte-ocp976"><h1>MX Record Planner</h1> <p class="card-subtitle svelte-ocp976">Plan MX record priorities with fallback guidance, best practices, and sample configurations for popular email
      providers.</p></div> <div class="grid-layout svelte-ocp976"><div class="input-section svelte-ocp976"><div class="domain-config svelte-ocp976"><div class="input-group"><label for="domain"><!> Domain</label> <input type="text" id="domain" placeholder="example.com" class="svelte-ocp976"/></div> <div class="input-group"><label for="ttl"><!> Default TTL (seconds)</label> <input type="number" id="ttl" min="60" max="86400" class="svelte-ocp976"/></div> <button class="add-record-btn svelte-ocp976"><!> Add MX Record</button></div> <div class="mx-records-section svelte-ocp976"><div class="section-header svelte-ocp976"><h3 class="svelte-ocp976">MX Records</h3> <button class="sort-btn svelte-ocp976"><!> </button></div> <div class="records-list svelte-ocp976"></div></div></div> <div class="examples-section svelte-ocp976"><details class="examples-toggle svelte-ocp976"><summary class="svelte-ocp976"><!> Quick Examples</summary> <div class="examples-grid svelte-ocp976"></div></details> <details class="guidance-toggle svelte-ocp976"><summary class="svelte-ocp976"><!> Priority Guidelines</summary> <div class="priority-guide svelte-ocp976"></div></details> <div class="info-panel svelte-ocp976"><h4 class="svelte-ocp976">MX Best Practices</h4> <ul class="svelte-ocp976"><li class="svelte-ocp976">Always have at least two MX records for redundancy</li> <li class="svelte-ocp976">Use different priority values to control mail flow</li> <li class="svelte-ocp976">Ensure all mail servers are properly configured</li> <li class="svelte-ocp976">Test mail delivery to all configured servers</li> <li class="svelte-ocp976">Consider geographic distribution for better performance</li></ul></div></div></div> <!></div>`);

export default function DNSMXPlanner($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let ttl = $.state(3600);

	let mxRecords = $.state($.proxy([
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
	]));

	let autoSort = $.state(true);
	let showExamples = $.state(false);
	let showGuidance = $.state(true);

	// Derived array for display - sorted or original order based on autoSort
	const displayMxRecords = $.derived(() => $.get(autoSort)
		? [...$.get(mxRecords)].sort((a, b) => a.priority - b.priority)
		: $.get(mxRecords));

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
		const newId = (Math.max(...$.get(mxRecords).map((r) => parseInt(r.id)), 0) + 1).toString();

		$.get(mxRecords).push({
			id: newId,
			priority: 30,
			mailserver: '',
			ttl: $.get(ttl),
			role: 'custom'
		});

		$.set(
			mxRecords, // Trigger reactivity
			$.get(mxRecords),
			true
		);
	}

	function removeMXRecord(id) {
		$.set(mxRecords, $.get(mxRecords).filter((r) => r.id !== id), true);
	}

	function updateRecord(id, field, value) {
		const record = $.get(mxRecords).find((r) => r.id === id);

		if (record) {
			record[field] = value;

			$.set(
				mxRecords, // Trigger reactivity
				$.get(mxRecords),
				true
			);
		}
	}

	function loadExample(example) {
		$.set(domain, example.domain, true);

		$.set(
			mxRecords,
			example.records.map((record, index) => ({
				id: (index + 1).toString(),
				priority: record.priority,
				mailserver: record.mailserver,
				ttl: $.get(ttl),
				role: record.role
			})),
			true
		);
	}

	function sortRecords() {
		$.set(autoSort, !$.get(autoSort));
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
		const duplicates = $.get(mxRecords).filter((r) => r.id !== record.id && r.priority === record.priority);

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
		const sortedRecords = [...$.get(mxRecords)].sort((a, b) => a.priority - b.priority);

		return sortedRecords.map((record) => `${$.get(domain)}. ${record.ttl} IN MX ${record.priority} ${record.mailserver}`).join('\n');
	}

	$.user_effect(() => {
		// Update TTL for all records when global TTL changes
		$.get(mxRecords).forEach((record) => record.ttl = $.get(ttl));

		$.set(
			mxRecords, // Trigger reactivity
			$.get(mxRecords),
			true
		);
	});

	var div = root_10();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var node = $.child(label);

	Icon(node, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the MX records');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var label_1 = $.child(div_5);
	var node_1 = $.child(label_1);

	Icon(node_1, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Default Time To Live in seconds for all MX records');

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_5);

	var button = $.sibling(div_5, 2);
	var node_2 = $.child(button);

	Icon(node_2, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var div_7 = $.child(div_6);
	var button_1 = $.sibling($.child(div_7), 2);
	var node_3 = $.child(button_1);

	Icon(node_3, { name: 'sort', size: 'sm' });

	var text_1 = $.sibling(node_3);

	$.reset(button_1);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);

	$.each(div_8, 21, () => $.get(displayMxRecords), (record) => record.id, ($$anchor, record) => {
		const validation = $.derived(() => validateMXRecord($.get(record)));
		var div_9 = root_3();
		let classes;
		var div_10 = $.child(div_9);
		var label_2 = $.child(div_10);

		$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Lower numbers = higher priority');

		var input_2 = $.sibling(label_2, 2);

		$.remove_input_defaults(input_2);

		var node_4 = $.sibling(input_2, 2);

		{
			var consequent = ($$anchor) => {
				const guideline = $.derived(() => getPriorityGuideline($.get(record).priority));
				var span = root();
				var text_2 = $.only_child(span, true);

				$.template_effect(() => {
					$.set_class(span, 1, `priority-hint ${$.get(guideline).color ?? ''}`, 'svelte-ocp976');
					$.set_text(text_2, $.get(guideline).usage);
				});

				$.append($$anchor, span);
			};

			$.if(node_4, ($$render) => {
				if ($.get(record).priority !== undefined) $$render(consequent);
			});
		}

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var label_3 = $.child(div_11);
		var input_3 = $.sibling(label_3, 2);

		$.remove_input_defaults(input_3);
		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var label_4 = $.child(div_12);
		var select = $.sibling(label_4, 2);
		var option = $.child(select);

		option.value = option.__value = 'primary';

		var option_1 = $.sibling(option);

		option_1.value = option_1.__value = 'backup';

		var option_2 = $.sibling(option_1);

		option_2.value = option_2.__value = 'custom';
		$.reset(select);

		var select_value;

		$.init_select(select);
		$.reset(div_12);

		var button_2 = $.sibling(div_12, 2);
		var node_5 = $.child(button_2);

		Icon(node_5, { name: 'trash', size: 'sm' });
		$.reset(button_2);

		var node_6 = $.sibling(button_2, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_13 = root_2();

				$.each(div_13, 21, () => $.get(validation).issues, $.index, ($$anchor, issue) => {
					var div_14 = root_1();
					var node_7 = $.child(div_14);

					Icon(node_7, { name: 'alert-circle', size: 'xs' });

					var text_3 = $.sibling(node_7);

					$.reset(div_14);
					$.template_effect(() => $.set_text(text_3, ` ${$.get(issue) ?? ''}`));
					$.append($$anchor, div_14);
				});

				$.reset(div_13);
				$.append($$anchor, div_13);
			};

			$.if(node_6, ($$render) => {
				if (!$.get(validation).valid) $$render(consequent_1);
			});
		}

		$.reset(div_9);

		$.template_effect(() => {
			classes = $.set_class(div_9, 1, 'record-row svelte-ocp976', null, classes, { error: !$.get(validation).valid });
			$.set_attribute(label_2, 'for', `priority-${$.get(record).id ?? ''}`);
			$.set_attribute(input_2, 'id', `priority-${$.get(record).id ?? ''}`);
			$.set_value(input_2, $.get(record).priority);
			$.set_attribute(label_3, 'for', `mailserver-${$.get(record).id ?? ''}`);
			$.set_attribute(input_3, 'id', `mailserver-${$.get(record).id ?? ''}`);
			$.set_value(input_3, $.get(record).mailserver);
			$.set_attribute(label_4, 'for', `role-${$.get(record).id ?? ''}`);
			$.set_attribute(select, 'id', `role-${$.get(record).id ?? ''}`);

			if (select_value !== (select_value = $.get(record).role)) {
				(
					select.value = (select.__value = select_value) ?? '',
					$.select_option(select, select_value)
				);
			}
		});

		$.delegated('input', input_2, (e) => updateRecord($.get(record).id, 'priority', parseInt(e.target.value)));
		$.delegated('input', input_3, (e) => updateRecord($.get(record).id, 'mailserver', e.target.value));
		$.delegated('change', select, (e) => updateRecord($.get(record).id, 'role', e.target.value));
		$.delegated('click', button_2, () => removeMXRecord($.get(record).id));
		$.append($$anchor, div_9);
	});

	$.reset(div_8);
	$.reset(div_6);
	$.reset(div_2);

	var div_15 = $.sibling(div_2, 2);
	var details = $.child(div_15);
	var summary = $.child(details);
	var node_8 = $.child(summary);

	Icon(node_8, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_16 = $.sibling(summary, 2);

	$.each(div_16, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button_3 = root_4();
		var h4 = $.child(button_3);
		var text_4 = $.only_child(h4, true);
		var p = $.sibling(h4, 2);
		var text_5 = $.only_child(p);

		$.reset(button_3);

		$.template_effect(() => {
			$.set_text(text_4, $.get(example).label);
			$.set_text(text_5, `${$.get(example).records.length ?? ''} MX records`);
		});

		$.delegated('click', button_3, () => loadExample($.get(example)));
		$.append($$anchor, button_3);
	});

	$.reset(div_16);
	$.reset(details);

	var details_1 = $.sibling(details, 2);
	var summary_1 = $.child(details_1);
	var node_9 = $.child(summary_1);

	Icon(node_9, { name: 'info', size: 'sm' });
	$.next();
	$.reset(summary_1);

	var div_17 = $.sibling(summary_1, 2);

	$.each(div_17, 21, () => priorityGuidelines, (guideline) => guideline.range, ($$anchor, guideline) => {
		var div_18 = root_5();
		var span_1 = $.child(div_18);
		var text_6 = $.only_child(span_1, true);
		var span_2 = $.sibling(span_1, 2);
		var text_7 = $.only_child(span_2, true);

		$.reset(div_18);

		$.template_effect(() => {
			$.set_class(div_18, 1, `guide-item ${$.get(guideline).color ?? ''}`, 'svelte-ocp976');
			$.set_text(text_6, $.get(guideline).range);
			$.set_text(text_7, $.get(guideline).usage);
		});

		$.append($$anchor, div_18);
	});

	$.reset(div_17);
	$.reset(details_1);
	$.next(2);
	$.reset(div_15);
	$.reset(div_1);

	var node_10 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_19 = root_9();
			var div_20 = $.child(div_19);
			var div_21 = $.sibling($.child(div_20), 2);
			var button_4 = $.child(div_21);
			var node_11 = $.child(button_4);

			Icon(node_11, { name: 'copy', size: 'sm' });
			$.next();
			$.reset(button_4);
			$.reset(div_21);
			$.reset(div_20);

			var div_22 = $.sibling(div_20, 2);
			var node_12 = $.sibling($.child(div_22), 2);

			$.each(node_12, 17, () => $.get(displayMxRecords), (record) => record.id, ($$anchor, record) => {
				const validation = $.derived(() => validateMXRecord($.get(record)));
				var div_23 = root_6();
				let classes_1;
				var div_24 = $.child(div_23);
				var text_8 = $.only_child(div_24, true);
				var div_25 = $.sibling(div_24, 2);
				var text_9 = $.only_child(div_25, true);
				var div_26 = $.sibling(div_25, 4);
				var span_3 = $.child(div_26);
				var text_10 = $.only_child(span_3, true);

				$.reset(div_26);

				var div_27 = $.sibling(div_26, 2);
				var text_11 = $.only_child(div_27, true);
				var div_28 = $.sibling(div_27, 2);
				var span_4 = $.child(div_28);
				var node_13 = $.child(span_4);

				{
					let $0 = $.derived(() => $.get(validation).valid ? 'check-circle' : 'x-circle');

					Icon(node_13, {
						get name() {
							return $.get($0);
						},
						size: 'xs'
					});
				}

				var text_12 = $.sibling(node_13);

				$.reset(span_4);
				$.reset(div_28);
				$.reset(div_23);

				$.template_effect(
					($0) => {
						classes_1 = $.set_class(div_23, 1, 'table-row svelte-ocp976', null, classes_1, { error: !$.get(validation).valid });
						$.set_text(text_8, $.get(domain));
						$.set_text(text_9, $.get(record).ttl);
						$.set_class(span_3, 1, `priority-badge ${$0 ?? ''}`, 'svelte-ocp976');
						$.set_text(text_10, $.get(record).priority);
						$.set_text(text_11, $.get(record).mailserver);
						$.set_class(span_4, 1, `status-badge ${$.get(validation).valid ? 'success' : 'error'}`, 'svelte-ocp976');
						$.set_text(text_12, ` ${$.get(validation).valid ? 'Valid' : 'Issues'}`);
					},
					[() => getPriorityGuideline($.get(record).priority).color]
				);

				$.append($$anchor, div_23);
			});

			$.reset(div_22);

			var node_14 = $.sibling(div_22, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_29 = root_8();
					var h3 = $.child(div_29);
					var node_15 = $.child(h3);

					Icon(node_15, { name: 'alert-triangle', size: 'sm' });
					$.next();
					$.reset(h3);

					var ul = $.sibling(h3, 2);

					$.each(ul, 21, () => $.get(mxRecords).filter((r) => !validateMXRecord(r).valid), (record) => record.id, ($$anchor, record) => {
						const validation = $.derived(() => validateMXRecord($.get(record)));
						var li = root_7();
						var strong = $.child(li);
						var text_13 = $.only_child(strong);
						var text_14 = $.sibling(strong);

						$.reset(li);

						$.template_effect(
							($0) => {
								$.set_text(text_13, `Priority ${$.get(record).priority ?? ''}`);
								$.set_text(text_14, `: ${$0 ?? ''}`);
							},
							[() => $.get(validation).issues.join(', ')]
						);

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				var d = $.derived(() => $.get(mxRecords).some((r) => !validateMXRecord(r).valid));

				$.if(node_14, ($$render) => {
					if ($.get(d)) $$render(consequent_2);
				});
			}

			$.reset(div_19);
			$.delegated('click', button_4, () => copyToClipboard(generateZoneFileRecords()));
			$.append($$anchor, div_19);
		};

		$.if(node_10, ($$render) => {
			if ($.get(mxRecords).length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text_1, ` ${$.get(autoSort) ? 'Original Order' : 'Sort by Priority'}`));
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_value(input_1, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.delegated('click', button, addMXRecord);
	$.delegated('click', button_1, sortRecords);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.bind_property('open', 'toggle', details_1, ($$value) => $.set(showGuidance, $$value), () => $.get(showGuidance));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);