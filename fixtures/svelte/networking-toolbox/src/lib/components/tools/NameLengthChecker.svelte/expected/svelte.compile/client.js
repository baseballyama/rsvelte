import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, checkNameLengths } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-name svelte-1tr73eu"> </div> <div class="example-description svelte-1tr73eu"> </div></button>`);
var root_1 = $.from_html(`<div class="success-card svelte-1tr73eu"><div class="success-content svelte-1tr73eu"><!> <div class="success-message svelte-1tr73eu"><h4 class="svelte-1tr73eu">All Names Valid!</h4> <p class="svelte-1tr73eu"> </p></div></div></div>`);
var root_2 = $.from_html(`<span> <span class="label-length svelte-1tr73eu"> </span></span> <!>`, 1);
var root_3 = $.from_html(`<div class="violation-labels svelte-1tr73eu"><strong class="svelte-1tr73eu">Labels:</strong> <!></div>`);
var root_4 = $.from_html(`<div class="violation-item svelte-1tr73eu"><div class="violation-header svelte-1tr73eu"><div class="violation-name svelte-1tr73eu"> </div> <div class="violation-stats svelte-1tr73eu"><span class="violation-length svelte-1tr73eu"> </span> <span class="violation-limit svelte-1tr73eu"> </span> <span class="violation-excess svelte-1tr73eu"> </span></div></div> <!></div>`);
var root_5 = $.from_html(`<div class="violation-category svelte-1tr73eu"><h5 class="svelte-1tr73eu"><!> </h5> <div class="violations-list svelte-1tr73eu"></div></div>`);
var root_6 = $.from_html(`<div class="violation-item svelte-1tr73eu"><div class="violation-header svelte-1tr73eu"><div class="violation-name svelte-1tr73eu"> </div> <div class="violation-stats svelte-1tr73eu"><span class="violation-length svelte-1tr73eu"> </span> <span class="violation-limit svelte-1tr73eu"> </span> <span class="violation-excess svelte-1tr73eu"> </span></div></div></div>`);
var root_7 = $.from_html(`<div class="violations-section svelte-1tr73eu"><h4 class="svelte-1tr73eu">Length Limit Violations</h4> <!> <!></div>`);
var root_8 = $.from_html(`<section class="results-section svelte-1tr73eu"><div class="results-header svelte-1tr73eu"><h3 class="svelte-1tr73eu">Name Length Validation Results</h3> <button><!> </button></div> <div class="results-inner svelte-1tr73eu"><div class="summary-card svelte-1tr73eu"><div class="summary-stats svelte-1tr73eu"><div class="stat-item total svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu"><!></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu"> </div> <div class="stat-label svelte-1tr73eu">Total Names</div></div></div> <div class="stat-item valid svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu"><!></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu"> </div> <div class="stat-label svelte-1tr73eu">Valid Names</div></div></div> <div class="stat-item violations svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu"><!></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu"> </div> <div class="stat-label svelte-1tr73eu">Violations</div></div></div> <div class="stat-item compliance svelte-1tr73eu"><div class="stat-icon svelte-1tr73eu"><!></div> <div class="stat-info svelte-1tr73eu"><div class="stat-value svelte-1tr73eu"> </div> <div class="stat-label svelte-1tr73eu">Compliance</div></div></div></div></div> <!></div></section>`);

var root_9 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Name Length Checker</h1> <p>Validate DNS names against RFC length limits: 63 bytes per label, 255 bytes per FQDN</p></header> <div class="card info-card svelte-1tr73eu"><div class="overview-content svelte-1tr73eu"><div class="overview-item svelte-1tr73eu"><!> <div><strong class="svelte-1tr73eu">Label Limits:</strong> Each DNS label must be 63 characters or fewer.</div></div> <div class="overview-item svelte-1tr73eu"><!> <div><strong class="svelte-1tr73eu">FQDN Limits:</strong> Complete domain names must be 255 characters or fewer.</div></div> <div class="overview-item svelte-1tr73eu"><!> <div><strong class="svelte-1tr73eu">Compliance:</strong> Exceeding limits causes DNS resolution failures.</div></div></div></div> <div class="card examples-card svelte-1tr73eu"><details class="examples-details svelte-1tr73eu"><summary class="examples-summary svelte-1tr73eu"><!> <h3 class="svelte-1tr73eu">Name Length Examples</h3></summary> <div class="examples-grid svelte-1tr73eu"></div></details></div> <div class="card input-card svelte-1tr73eu"><div class="input-group svelte-1tr73eu"><label for="zone-input" class="svelte-1tr73eu"><!> Zone File Content</label> <textarea id="zone-input" placeholder="example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
very-long-subdomain-name.example.com.	IN	A	192.0.2.2" class="zone-textarea svelte-1tr73eu" rows="10"></textarea></div></div> <!> <div class="education-card svelte-1tr73eu"><div class="education-grid svelte-1tr73eu"><div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">DNS Name Limits</h4> <p class="svelte-1tr73eu">DNS names have strict length limits defined by RFC specifications. Each label (part between dots) must be 63
          octets or less, and the complete FQDN must not exceed 255 octets including the length encoding.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Impact of Violations</h4> <p class="svelte-1tr73eu">Names exceeding these limits will cause DNS resolution failures. Some resolvers may truncate names, while
          others will reject them entirely. This can break applications and services relying on these names.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Common Causes</h4> <p class="svelte-1tr73eu">Long names often result from deep subdomain structures, verbose naming conventions, or automated name
          generation. Consider shorter alternatives or restructuring your DNS hierarchy to stay within limits.</p></div> <div class="education-item info-panel svelte-1tr73eu"><h4 class="svelte-1tr73eu">Best Practices</h4> <p class="svelte-1tr73eu">Use concise, descriptive names. Avoid unnecessary subdomains and overly verbose labels. Regularly validate
          zone files during development. Consider using aliases or redirects for shorter public-facing names.</p></div></div></div></div>`);

export default function NameLengthChecker($$anchor, $$props) {
	$.push($$props, true);

	let zoneInput = $.state('');
	let results = $.state(null);
	const clipboard = useClipboard();
	let activeExampleIndex = $.state(null);

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
		$.set(zoneInput, example.content, true);
		$.set(activeExampleIndex, index, true);
		checkNames();
	}

	function clearActiveIfChanged() {
		if ($.get(activeExampleIndex) !== null) {
			const activeExample = examples[$.get(activeExampleIndex)];

			if (!activeExample || $.get(zoneInput) !== activeExample.content) {
				$.set(activeExampleIndex, null);
			}
		}
	}

	function checkNames() {
		if (!$.get(zoneInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const parsed = parseZoneFile($.get(zoneInput));
			const violations = checkNameLengths(parsed);

			// Count unique names
			const uniqueNames = new Set(parsed.records.map((r) => r.owner));

			$.set(
				results,
				{
					violations,
					totalNames: uniqueNames.size,
					validNames: uniqueNames.size - new Set(violations.map((v) => v.name)).size
				},
				true
			);
		} catch(error) {
			console.error('Failed to check names:', error);
			$.set(results, null);
		}
	}

	function copyResults() {
		if (!$.get(results)) return;

		const reportText = formatReportForCopy($.get(results));

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

	var div = root_9();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'ruler', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'maximize', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'alert-triangle', size: 'sm' });
	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 23, () => examples, (example) => example.name, ($$anchor, example, index) => {
		var button = root();
		var div_8 = $.child(button);
		var text = $.only_child(div_8, true);
		var div_9 = $.sibling(div_8, 2);
		var text_1 = $.only_child(div_9, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1tr73eu');
			$.set_text(text, $.get(example).name);
			$.set_text(text_1, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_10 = $.sibling(div_6, 2);
	var div_11 = $.child(div_10);
	var label_1 = $.child(div_11);
	var node_4 = $.child(label_1);

	Icon(node_4, { name: 'file', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste DNS zone file content to validate all domain names against length limits');

	var textarea = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_11);
	$.reset(div_10);

	var node_5 = $.sibling(div_10, 2);

	{
		var consequent_5 = ($$anchor) => {
			var section = root_8();
			var div_12 = $.child(section);
			var button_1 = $.sibling($.child(div_12), 2);
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_2 = $.sibling(node_6);

			$.reset(button_1);
			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var div_14 = $.child(div_13);
			var div_15 = $.child(div_14);
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var node_7 = $.child(div_17);

			Icon(node_7, { name: 'hash', size: 'lg' });
			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var div_19 = $.child(div_18);
			var text_3 = $.only_child(div_19, true);

			$.next(2);
			$.reset(div_18);
			$.reset(div_16);

			var div_20 = $.sibling(div_16, 2);
			var div_21 = $.child(div_20);
			var node_8 = $.child(div_21);

			Icon(node_8, { name: 'check-circle', size: 'lg' });
			$.reset(div_21);

			var div_22 = $.sibling(div_21, 2);
			var div_23 = $.child(div_22);
			var text_4 = $.only_child(div_23, true);

			$.next(2);
			$.reset(div_22);
			$.reset(div_20);

			var div_24 = $.sibling(div_20, 2);
			var div_25 = $.child(div_24);
			var node_9 = $.child(div_25);

			Icon(node_9, { name: 'alert-triangle', size: 'lg' });
			$.reset(div_25);

			var div_26 = $.sibling(div_25, 2);
			var div_27 = $.child(div_26);
			var text_5 = $.only_child(div_27, true);

			$.next(2);
			$.reset(div_26);
			$.reset(div_24);

			var div_28 = $.sibling(div_24, 2);
			var div_29 = $.child(div_28);
			var node_10 = $.child(div_29);

			{
				let $0 = $.derived(() => $.get(results).violations.length === 0 ? 'shield-check' : 'shield-alert');

				Icon(node_10, {
					get name() {
						return $.get($0);
					},
					size: 'lg'
				});
			}

			$.reset(div_29);

			var div_30 = $.sibling(div_29, 2);
			var div_31 = $.child(div_30);
			var text_6 = $.only_child(div_31, true);

			$.next(2);
			$.reset(div_30);
			$.reset(div_28);
			$.reset(div_15);
			$.reset(div_14);

			var node_11 = $.sibling(div_14, 2);

			{
				var consequent = ($$anchor) => {
					var div_32 = root_1();
					var div_33 = $.child(div_32);
					var node_12 = $.child(div_33);

					Icon(node_12, { name: 'check-circle', size: 'lg' });

					var div_34 = $.sibling(node_12, 2);
					var p = $.sibling($.child(div_34), 2);
					var text_7 = $.only_child(p);

					$.reset(div_34);
					$.reset(div_33);
					$.reset(div_32);
					$.template_effect(() => $.set_text(text_7, `All ${$.get(results).totalNames ?? ''} domain names in your zone comply with DNS length limits.`));
					$.append($$anchor, div_32);
				};

				var alternate = ($$anchor) => {
					var div_35 = root_7();
					var node_13 = $.sibling($.child(div_35), 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_36 = root_5();
							var h5 = $.child(div_36);
							var node_14 = $.child(h5);

							Icon(node_14, { name: 'tag', size: 'sm' });

							var text_8 = $.sibling(node_14);

							$.reset(h5);

							var div_37 = $.sibling(h5, 2);

							$.each(div_37, 21, () => $.get(results).violations.filter((v) => v.type === 'label'), (violation) => violation.name, ($$anchor, violation) => {
								var div_38 = root_4();
								var div_39 = $.child(div_38);
								var div_40 = $.child(div_39);
								var text_9 = $.only_child(div_40, true);
								var div_41 = $.sibling(div_40, 2);
								var span = $.child(div_41);
								var text_10 = $.only_child(span);
								var span_1 = $.sibling(span, 2);
								var text_11 = $.only_child(span_1);
								var span_2 = $.sibling(span_1, 2);
								var text_12 = $.only_child(span_2);

								$.reset(div_41);
								$.reset(div_39);

								var node_15 = $.sibling(div_39, 2);

								{
									var consequent_2 = ($$anchor) => {
										var div_42 = root_3();
										var node_16 = $.sibling($.child(div_42), 2);

										$.each(node_16, 18, () => $.get(violation).labels, (label) => label, ($$anchor, label, index) => {
											var fragment = root_2();
											var span_3 = $.first_child(fragment);
											var text_13 = $.child(span_3);
											var span_4 = $.sibling(text_13);
											var text_14 = $.only_child(span_4);

											$.reset(span_3);

											var node_17 = $.sibling(span_3, 2);

											{
												var consequent_1 = ($$anchor) => {
													var text_15 = $.text('•');

													$.append($$anchor, text_15);
												};

												$.if(node_17, ($$render) => {
													if ($.get(index) < $.get(violation).labels.length - 1) $$render(consequent_1);
												});
											}

											$.template_effect(() => {
												$.set_class(span_3, 1, `label-item ${label.length > 63 ? 'invalid' : 'valid'}`, 'svelte-1tr73eu');
												$.set_text(text_13, `${label ?? ''} `);
												$.set_text(text_14, `(${label.length ?? ''})`);
											});

											$.append($$anchor, fragment);
										});

										$.reset(div_42);
										$.append($$anchor, div_42);
									};

									$.if(node_15, ($$render) => {
										if ($.get(violation).labels) $$render(consequent_2);
									});
								}

								$.reset(div_38);

								$.template_effect(
									($0, $1) => {
										$.set_style(div_38, `border-left-color: ${$0 ?? ''}`);
										$.set_text(text_9, $.get(violation).name);
										$.set_style(span, `color: ${$1 ?? ''}`);
										$.set_text(text_10, `${$.get(violation).length ?? ''} chars`);
										$.set_text(text_11, `(limit: ${$.get(violation).limit ?? ''})`);
										$.set_text(text_12, `+${$.get(violation).length - $.get(violation).limit} over`);
									},
									[
										() => getViolationColor($.get(violation)),
										() => getViolationColor($.get(violation))
									]
								);

								$.append($$anchor, div_38);
							});

							$.reset(div_37);
							$.reset(div_36);

							$.template_effect(($0) => $.set_text(text_8, ` Label Length Violations (${$0 ?? ''})`), [
								() => $.get(results).violations.filter((v) => v.type === 'label').length
							]);

							$.append($$anchor, div_36);
						};

						var d = $.derived(() => $.get(results).violations.filter((v) => v.type === 'label').length > 0);

						$.if(node_13, ($$render) => {
							if ($.get(d)) $$render(consequent_3);
						});
					}

					var node_18 = $.sibling(node_13, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_43 = root_5();
							var h5_1 = $.child(div_43);
							var node_19 = $.child(h5_1);

							Icon(node_19, { name: 'globe', size: 'sm' });

							var text_16 = $.sibling(node_19);

							$.reset(h5_1);

							var div_44 = $.sibling(h5_1, 2);

							$.each(div_44, 21, () => $.get(results).violations.filter((v) => v.type === 'fqdn'), (violation) => violation.name, ($$anchor, violation) => {
								var div_45 = root_6();
								var div_46 = $.child(div_45);
								var div_47 = $.child(div_46);
								var text_17 = $.only_child(div_47, true);
								var div_48 = $.sibling(div_47, 2);
								var span_5 = $.child(div_48);
								var text_18 = $.only_child(span_5);
								var span_6 = $.sibling(span_5, 2);
								var text_19 = $.only_child(span_6);
								var span_7 = $.sibling(span_6, 2);
								var text_20 = $.only_child(span_7);

								$.reset(div_48);
								$.reset(div_46);
								$.reset(div_45);

								$.template_effect(
									($0, $1) => {
										$.set_style(div_45, `border-left-color: ${$0 ?? ''}`);
										$.set_text(text_17, $.get(violation).name);
										$.set_style(span_5, `color: ${$1 ?? ''}`);
										$.set_text(text_18, `${$.get(violation).length ?? ''} chars`);
										$.set_text(text_19, `(limit: ${$.get(violation).limit ?? ''})`);
										$.set_text(text_20, `+${$.get(violation).length - $.get(violation).limit} over`);
									},
									[
										() => getViolationColor($.get(violation)),
										() => getViolationColor($.get(violation))
									]
								);

								$.append($$anchor, div_45);
							});

							$.reset(div_44);
							$.reset(div_43);

							$.template_effect(($0) => $.set_text(text_16, ` FQDN Length Violations (${$0 ?? ''})`), [
								() => $.get(results).violations.filter((v) => v.type === 'fqdn').length
							]);

							$.append($$anchor, div_43);
						};

						var d_1 = $.derived(() => $.get(results).violations.filter((v) => v.type === 'fqdn').length > 0);

						$.if(node_18, ($$render) => {
							if ($.get(d_1)) $$render(consequent_4);
						});
					}

					$.reset(div_35);
					$.append($$anchor, div_35);
				};

				$.if(node_11, ($$render) => {
					if ($.get(results).violations.length === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_13);
			$.reset(section);

			$.template_effect(
				($0, $1, $2) => {
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-1tr73eu');
					$.set_text(text_2, ` ${$1 ?? ''}`);
					$.set_text(text_3, $.get(results).totalNames);
					$.set_text(text_4, $.get(results).validNames);
					$.set_text(text_5, $.get(results).violations.length);
					$.set_text(text_6, $2);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Report',
					() => $.get(results).violations.length === 0
						? '100%'
						: `${($.get(results).validNames / $.get(results).totalNames * 100).toFixed(1)}%`
				]
			);

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, section);
		};

		$.if(node_5, ($$render) => {
			if ($.get(results)) $$render(consequent_5);
		});
	}

	$.next(2);
	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(zoneInput), ($$value) => $.set(zoneInput, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);