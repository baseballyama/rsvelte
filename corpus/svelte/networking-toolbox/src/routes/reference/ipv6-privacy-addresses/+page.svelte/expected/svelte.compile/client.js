import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ipv6PrivacyContent } from '$lib/content/ipv6-privacy-addresses.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Formation:</strong> </div> <div><strong>Example:</strong> <code> </code></div> <div><strong>Privacy Level:</strong> </div> <h4>Characteristics:</h4> <ul></ul></div></div>`);
var root_2 = $.from_html(`<code class="example-input"> </code>`);
var root_3 = $.from_html(`<li><code> </code></li>`);
var root_4 = $.from_html(`<h4>Values:</h4> <ul></ul>`, 1);
var root_5 = $.from_html(`<div><strong>Behavior:</strong> </div>`);
var root_6 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Default Behavior:</strong> </div> <h4>Configuration:</h4> <!> <!> <h4>Useful Commands:</h4> <!> <!></div></div>`);
var root_7 = $.from_html(`<tr><td><strong> </strong></td><td> </td><td> </td><td> </td></tr>`);
var root_8 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Symptoms:</strong> </p> <p><strong>Diagnosis:</strong> </p> <div><strong>Solutions:</strong></div> <ul></ul></div></div>`);
var root_9 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><h4>Benefits:</h4> <ul></ul> <h4> </h4> <ul></ul></div></div>`);
var root_10 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Recommendation:</strong> </div> <div><strong>Reasoning:</strong> </div> <div><strong>Configuration:</strong> </div></div></div>`);
var root_11 = $.from_html(`<div class="item-description"> </div>`);
var root_12 = $.from_html(`<div class="item-code"> </div>`);
var root_13 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div></div>`);

var root_14 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>IPv6 Address Types</h2> <!></div> <div class="ref-section"><h2> </h2> <h3>Address Generation Process</h3> <ol></ol> <h3>Temporary Address Lifecycle</h3> <ol></ol> <h3>Default Operating System Behavior</h3> <ul></ul></div> <div class="ref-section"><h2> </h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Preferred Lifetime</div> <div class="item-description"> </div> <div><strong>Typical:</strong> </div> <div><strong>Behavior:</strong> </div></div> <div class="grid-item"><div class="item-title">Valid Lifetime</div> <div class="item-description"> </div> <div><strong>Typical:</strong> </div> <div><strong>Behavior:</strong> </div></div> <div class="grid-item"><div class="item-title">Regeneration Interval</div> <div class="item-description"> </div> <div><strong>Typical:</strong> </div> <div><strong>Behavior:</strong> </div></div> <div class="grid-item"><div class="item-title">Max Temporary Addresses</div> <div class="item-description"> </div> <div><strong>Typical:</strong> </div> <div><strong>Behavior:</strong> </div></div></div></div> <div class="ref-section"><h2> </h2> <!></div> <div class="ref-section"><h2>Identifying Address Types</h2> <table class="ref-table"><thead><tr><th>Method</th><th>Stable Address</th><th>Temporary Address</th><th>Example</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Troubleshooting</h2> <!></div> <div class="ref-section"><h2>Security Considerations</h2> <!></div> <div class="ref-section"><h2>When to Use Privacy Addresses</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Common Mistakes</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Address Types</div> <!></div> <div class="grid-item"><div class="item-title">Identification</div> <!></div></div> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Configuration</div> <!></div> <div class="grid-item"><div class="item-title">Troubleshooting</div> <!></div></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Point</div> <div class="highlight-content">Privacy extensions create multiple IPv6 addresses per interface. Temporary addresses change periodically for
          privacy, while stable addresses remain consistent for services. Both can coexist on the same interface.</div></div></div> <div class="ref-section"><h2>Useful Tools</h2> <div class="ref-grid two-col"></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_14();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h2 = $.child(div_3);
	var text_2 = $.only_child(h2, true);
	var p_1 = $.sibling(h2, 2);
	var text_3 = $.only_child(p_1, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var h2_1 = $.child(div_4);
	var text_4 = $.only_child(h2_1, true);
	var p_2 = $.sibling(h2_1, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node = $.sibling($.child(div_5), 2);

	$.each(node, 19, () => ipv6PrivacyContent.addressTypes, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_6 = root_1();
		var div_7 = $.child(div_6);
		var text_6 = $.only_child(div_7, true);
		var div_8 = $.sibling(div_7, 2);
		var div_9 = $.child(div_8);
		var text_7 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var code = $.sibling($.child(div_10), 2);
		var text_8 = $.only_child(code, true);

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_9 = $.sibling($.child(div_11));

		$.reset(div_11);

		var ul = $.sibling(div_11, 4);

		$.each(ul, 23, () => $.get(type).characteristics, (characteristic, index) => `characteristic-${index}`, ($$anchor, characteristic, index, $$array) => {
			var li = root();
			var text_10 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_10, $.get(characteristic)));
			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_8);
		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_6, $.get(type).type);
			$.set_text(text_7, ` ${$.get(type).formation ?? ''}`);
			$.set_text(text_8, $.get(type).example);
			$.set_text(text_9, ` ${$.get(type).privacy ?? ''}`);
		});

		$.append($$anchor, div_6);
	});

	$.reset(div_5);

	var div_12 = $.sibling(div_5, 2);
	var h2_2 = $.child(div_12);
	var text_11 = $.only_child(h2_2, true);
	var ol = $.sibling(h2_2, 4);

	$.each(ol, 23, () => ipv6PrivacyContent.howItWorks.addressGeneration, (step, index) => `gen-step-${index}`, ($$anchor, step) => {
		var li_1 = root();
		var text_12 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_12, $.get(step)));
		$.append($$anchor, li_1);
	});

	$.reset(ol);

	var ol_1 = $.sibling(ol, 4);

	$.each(ol_1, 23, () => ipv6PrivacyContent.howItWorks.temporaryLifecycle, (step, index) => `lifecycle-step-${index}`, ($$anchor, step) => {
		var li_2 = root();
		var text_13 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_13, $.get(step)));
		$.append($$anchor, li_2);
	});

	$.reset(ol_1);

	var ul_1 = $.sibling(ol_1, 4);

	$.each(ul_1, 23, () => ipv6PrivacyContent.howItWorks.defaultBehavior, (behavior, index) => `behavior-${index}`, ($$anchor, behavior) => {
		var li_3 = root();
		var text_14 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_14, $.get(behavior)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_1);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var h2_3 = $.child(div_13);
	var text_15 = $.only_child(h2_3, true);
	var div_14 = $.sibling(h2_3, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.sibling($.child(div_15), 2);
	var text_16 = $.only_child(div_16, true);
	var div_17 = $.sibling(div_16, 2);
	var text_17 = $.sibling($.child(div_17));

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var text_18 = $.sibling($.child(div_18));

	$.reset(div_18);
	$.reset(div_15);

	var div_19 = $.sibling(div_15, 2);
	var div_20 = $.sibling($.child(div_19), 2);
	var text_19 = $.only_child(div_20, true);
	var div_21 = $.sibling(div_20, 2);
	var text_20 = $.sibling($.child(div_21));

	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var text_21 = $.sibling($.child(div_22));

	$.reset(div_22);
	$.reset(div_19);

	var div_23 = $.sibling(div_19, 2);
	var div_24 = $.sibling($.child(div_23), 2);
	var text_22 = $.only_child(div_24, true);
	var div_25 = $.sibling(div_24, 2);
	var text_23 = $.sibling($.child(div_25));

	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var text_24 = $.sibling($.child(div_26));

	$.reset(div_26);
	$.reset(div_23);

	var div_27 = $.sibling(div_23, 2);
	var div_28 = $.sibling($.child(div_27), 2);
	var text_25 = $.only_child(div_28, true);
	var div_29 = $.sibling(div_28, 2);
	var text_26 = $.sibling($.child(div_29));

	$.reset(div_29);

	var div_30 = $.sibling(div_29, 2);
	var text_27 = $.sibling($.child(div_30));

	$.reset(div_30);
	$.reset(div_27);
	$.reset(div_14);
	$.reset(div_13);

	var div_31 = $.sibling(div_13, 2);
	var h2_4 = $.child(div_31);
	var text_28 = $.only_child(h2_4, true);
	var node_1 = $.sibling(h2_4, 2);

	$.each(node_1, 17, () => Object.entries(ipv6PrivacyContent.osImplementations), ([key, os]) => key, ($$anchor, $$item) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array_1)[0];
		let os = () => $.get($$array_1)[1];
		var fragment = $.comment();
		var node_2 = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var div_32 = root_6();
				var div_33 = $.child(div_32);
				var text_29 = $.only_child(div_33, true);
				var div_34 = $.sibling(div_33, 2);
				var div_35 = $.child(div_34);
				var text_30 = $.sibling($.child(div_35));

				$.reset(div_35);

				var node_3 = $.sibling(div_35, 4);

				$.each(node_3, 19, () => os().configuration, (config, index) => `config-${index}`, ($$anchor, config) => {
					var code_1 = root_2();
					var text_31 = $.only_child(code_1, true);

					$.template_effect(() => $.set_text(text_31, $.get(config)));
					$.append($$anchor, code_1);
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root_4();
						var ul_2 = $.sibling($.first_child(fragment_1), 2);

						$.each(ul_2, 23, () => os().values, (value, index) => `value-${index}`, ($$anchor, value) => {
							var li_4 = root_3();
							var code_2 = $.child(li_4);
							var text_32 = $.only_child(code_2, true);

							$.reset(li_4);
							$.template_effect(() => $.set_text(text_32, $.get(value)));
							$.append($$anchor, li_4);
						});

						$.reset(ul_2);
						$.append($$anchor, fragment_1);
					};

					$.if(node_4, ($$render) => {
						if (os().values) $$render(consequent);
					});
				}

				var node_5 = $.sibling(node_4, 4);

				$.each(node_5, 19, () => os().commands, (command, index) => `command-${index}`, ($$anchor, command) => {
					var code_3 = root_2();
					var text_33 = $.only_child(code_3, true);

					$.template_effect(() => $.set_text(text_33, $.get(command)));
					$.append($$anchor, code_3);
				});

				var node_6 = $.sibling(node_5, 2);

				{
					var consequent_1 = ($$anchor) => {
						var div_36 = root_5();
						var text_34 = $.sibling($.child(div_36));

						$.reset(div_36);
						$.template_effect(() => $.set_text(text_34, ` ${os().behavior ?? ''}`));
						$.append($$anchor, div_36);
					};

					$.if(node_6, ($$render) => {
						if (os().behavior) $$render(consequent_1);
					});
				}

				$.reset(div_34);
				$.reset(div_32);

				$.template_effect(() => {
					$.set_text(text_29, os().os);
					$.set_text(text_30, ` ${os().defaultBehavior ?? ''}`);
				});

				$.append($$anchor, div_32);
			};

			$.if(node_2, ($$render) => {
				if (typeof os() === 'object' && os().os) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_31);

	var div_37 = $.sibling(div_31, 2);
	var table = $.sibling($.child(div_37), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => ipv6PrivacyContent.identifyingAddresses, (method, index) => `method-${index}`, ($$anchor, method) => {
		var tr = root_7();
		var td = $.child(tr);
		var strong = $.child(td);
		var text_35 = $.only_child(strong, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_36 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_37 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_38 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_35, $.get(method).method);
			$.set_text(text_36, $.get(method).stable);
			$.set_text(text_37, $.get(method).temporary);
			$.set_text(text_38, $.get(method).example);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_37);

	var div_38 = $.sibling(div_37, 2);
	var node_7 = $.sibling($.child(div_38), 2);

	$.each(node_7, 19, () => ipv6PrivacyContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_39 = root_8();
		var div_40 = $.child(div_39);
		var node_8 = $.child(div_40);

		Icon(node_8, { name: 'help-circle', size: 'sm' });

		var text_39 = $.sibling(node_8);

		$.reset(div_40);

		var div_41 = $.sibling(div_40, 2);
		var p_3 = $.child(div_41);
		var text_40 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_41 = $.sibling($.child(p_4));

		$.reset(p_4);

		var ul_3 = $.sibling(p_4, 4);

		$.each(ul_3, 23, () => $.get(issue).solutions, (solution, index) => `solution-${index}`, ($$anchor, solution, index, $$array_2) => {
			var li_5 = root();
			var text_42 = $.only_child(li_5, true);

			$.template_effect(() => $.set_text(text_42, $.get(solution)));
			$.append($$anchor, li_5);
		});

		$.reset(ul_3);
		$.reset(div_41);
		$.reset(div_39);

		$.template_effect(
			($0) => {
				$.set_text(text_39, ` ${$.get(issue).issue ?? ''}`);
				$.set_text(text_40, ` ${$0 ?? ''}`);
				$.set_text(text_41, ` ${$.get(issue).diagnosis ?? ''}`);
			},
			[() => $.get(issue).symptoms.join(', ')]
		);

		$.append($$anchor, div_39);
	});

	$.reset(div_38);

	var div_42 = $.sibling(div_38, 2);
	var node_9 = $.sibling($.child(div_42), 2);

	$.each(node_9, 19, () => ipv6PrivacyContent.securityConsiderations, (security, index) => `${security.aspect}-${index}`, ($$anchor, security) => {
		var div_43 = root_9();
		var div_44 = $.child(div_43);
		var text_43 = $.only_child(div_44, true);
		var div_45 = $.sibling(div_44, 2);
		var ul_4 = $.sibling($.child(div_45), 2);

		$.each(ul_4, 23, () => $.get(security).benefits, (benefit, index) => `benefit-${index}`, ($$anchor, benefit, index, $$array_3) => {
			var li_6 = root();
			var text_44 = $.only_child(li_6, true);

			$.template_effect(() => $.set_text(text_44, $.get(benefit)));
			$.append($$anchor, li_6);
		});

		$.reset(ul_4);

		var h4 = $.sibling(ul_4, 2);
		var text_45 = $.only_child(h4);
		var ul_5 = $.sibling(h4, 2);

		$.each(ul_5, 23, () => $.get(security).limitations || $.get(security).challenges, (item, index) => `limitation-${index}`, ($$anchor, item, index, $$array_4) => {
			var li_7 = root();
			var text_46 = $.only_child(li_7, true);

			$.template_effect(() => $.set_text(text_46, $.get(item)));
			$.append($$anchor, li_7);
		});

		$.reset(ul_5);
		$.reset(div_45);
		$.reset(div_43);

		$.template_effect(() => {
			$.set_text(text_43, $.get(security).aspect);
			$.set_text(text_45, `${$.get(security).limitations ? 'Limitations' : 'Challenges'}:`);
		});

		$.append($$anchor, div_43);
	});

	$.reset(div_42);

	var div_46 = $.sibling(div_42, 2);
	var node_10 = $.sibling($.child(div_46), 2);

	$.each(node_10, 19, () => ipv6PrivacyContent.whenToUse, (scenario, index) => `${scenario.scenario}-${index}`, ($$anchor, scenario) => {
		var div_47 = root_10();
		var div_48 = $.child(div_47);
		var text_47 = $.only_child(div_48, true);
		var div_49 = $.sibling(div_48, 2);
		var div_50 = $.child(div_49);
		var text_48 = $.sibling($.child(div_50));

		$.reset(div_50);

		var div_51 = $.sibling(div_50, 2);
		var text_49 = $.sibling($.child(div_51));

		$.reset(div_51);

		var div_52 = $.sibling(div_51, 2);
		var text_50 = $.sibling($.child(div_52));

		$.reset(div_52);
		$.reset(div_49);
		$.reset(div_47);

		$.template_effect(() => {
			$.set_text(text_47, $.get(scenario).scenario);
			$.set_text(text_48, ` ${$.get(scenario).recommendation ?? ''}`);
			$.set_text(text_49, ` ${$.get(scenario).reasoning ?? ''}`);
			$.set_text(text_50, ` ${$.get(scenario).configuration ?? ''}`);
		});

		$.append($$anchor, div_47);
	});

	$.reset(div_46);

	var div_53 = $.sibling(div_46, 2);
	var ul_6 = $.sibling($.child(div_53), 2);

	$.each(ul_6, 23, () => ipv6PrivacyContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_8 = root();
		var text_51 = $.only_child(li_8, true);

		$.template_effect(() => $.set_text(text_51, $.get(practice)));
		$.append($$anchor, li_8);
	});

	$.reset(ul_6);
	$.reset(div_53);

	var div_54 = $.sibling(div_53, 2);
	var ul_7 = $.sibling($.child(div_54), 2);

	$.each(ul_7, 23, () => ipv6PrivacyContent.commonMistakes, (mistake, index) => `mistake-${index}`, ($$anchor, mistake) => {
		var li_9 = root();
		var text_52 = $.only_child(li_9, true);

		$.template_effect(() => $.set_text(text_52, $.get(mistake)));
		$.append($$anchor, li_9);
	});

	$.reset(ul_7);
	$.reset(div_54);

	var div_55 = $.sibling(div_54, 2);
	var div_56 = $.sibling($.child(div_55), 2);
	var div_57 = $.child(div_56);
	var node_11 = $.sibling($.child(div_57), 2);

	$.each(node_11, 19, () => ipv6PrivacyContent.quickReference.addressTypes, (type, index) => `qr-type-${index}`, ($$anchor, type) => {
		var div_58 = root_11();
		var text_53 = $.only_child(div_58, true);

		$.template_effect(() => $.set_text(text_53, $.get(type)));
		$.append($$anchor, div_58);
	});

	$.reset(div_57);

	var div_59 = $.sibling(div_57, 2);
	var node_12 = $.sibling($.child(div_59), 2);

	$.each(node_12, 19, () => ipv6PrivacyContent.quickReference.identification, (tip, index) => `qr-id-${index}`, ($$anchor, tip) => {
		var div_60 = root_11();
		var text_54 = $.only_child(div_60, true);

		$.template_effect(() => $.set_text(text_54, $.get(tip)));
		$.append($$anchor, div_60);
	});

	$.reset(div_59);
	$.reset(div_56);

	var div_61 = $.sibling(div_56, 2);
	var div_62 = $.child(div_61);
	var node_13 = $.sibling($.child(div_62), 2);

	$.each(node_13, 19, () => ipv6PrivacyContent.quickReference.configuration, (config, index) => `qr-config-${index}`, ($$anchor, config) => {
		var div_63 = root_12();
		var text_55 = $.only_child(div_63, true);

		$.template_effect(() => $.set_text(text_55, $.get(config)));
		$.append($$anchor, div_63);
	});

	$.reset(div_62);

	var div_64 = $.sibling(div_62, 2);
	var node_14 = $.sibling($.child(div_64), 2);

	$.each(node_14, 19, () => ipv6PrivacyContent.quickReference.troubleshooting, (tip, index) => `qr-trouble-${index}`, ($$anchor, tip) => {
		var div_65 = root_11();
		var text_56 = $.only_child(div_65, true);

		$.template_effect(() => $.set_text(text_56, $.get(tip)));
		$.append($$anchor, div_65);
	});

	$.reset(div_64);
	$.reset(div_61);

	var div_66 = $.sibling(div_61, 2);
	var div_67 = $.child(div_66);
	var node_15 = $.child(div_67);

	Icon(node_15, { name: 'key', size: 'sm' });
	$.next();
	$.reset(div_67);
	$.next(2);
	$.reset(div_66);
	$.reset(div_55);

	var div_68 = $.sibling(div_55, 2);
	var div_69 = $.sibling($.child(div_68), 2);

	$.each(div_69, 23, () => ipv6PrivacyContent.tools, (tool, index) => `${tool.tool}-${index}`, ($$anchor, tool) => {
		var div_70 = root_13();
		var div_71 = $.child(div_70);
		var text_57 = $.only_child(div_71, true);
		var div_72 = $.sibling(div_71, 2);
		var text_58 = $.only_child(div_72, true);

		$.reset(div_70);

		$.template_effect(() => {
			$.set_text(text_57, $.get(tool).tool);
			$.set_text(text_58, $.get(tool).purpose);
		});

		$.append($$anchor, div_70);
	});

	$.reset(div_69);
	$.reset(div_68);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ipv6PrivacyContent.title);
		$.set_text(text_1, ipv6PrivacyContent.description);
		$.set_text(text_2, ipv6PrivacyContent.sections.overview.title);
		$.set_text(text_3, ipv6PrivacyContent.sections.overview.content);
		$.set_text(text_4, ipv6PrivacyContent.sections.problem.title);
		$.set_text(text_5, ipv6PrivacyContent.sections.problem.content);
		$.set_text(text_11, ipv6PrivacyContent.howItWorks.title);
		$.set_text(text_15, ipv6PrivacyContent.lifetimes.title);
		$.set_text(text_16, ipv6PrivacyContent.lifetimes.preferredLifetime.description);
		$.set_text(text_17, ` ${ipv6PrivacyContent.lifetimes.preferredLifetime.typical ?? ''}`);
		$.set_text(text_18, ` ${ipv6PrivacyContent.lifetimes.preferredLifetime.behavior ?? ''}`);
		$.set_text(text_19, ipv6PrivacyContent.lifetimes.validLifetime.description);
		$.set_text(text_20, ` ${ipv6PrivacyContent.lifetimes.validLifetime.typical ?? ''}`);
		$.set_text(text_21, ` ${ipv6PrivacyContent.lifetimes.validLifetime.behavior ?? ''}`);
		$.set_text(text_22, ipv6PrivacyContent.lifetimes.regenerationInterval.description);
		$.set_text(text_23, ` ${ipv6PrivacyContent.lifetimes.regenerationInterval.typical ?? ''}`);
		$.set_text(text_24, ` ${ipv6PrivacyContent.lifetimes.regenerationInterval.behavior ?? ''}`);
		$.set_text(text_25, ipv6PrivacyContent.lifetimes.maxTempAddresses.description);
		$.set_text(text_26, ` ${ipv6PrivacyContent.lifetimes.maxTempAddresses.typical ?? ''}`);
		$.set_text(text_27, ` ${ipv6PrivacyContent.lifetimes.maxTempAddresses.behavior ?? ''}`);
		$.set_text(text_28, ipv6PrivacyContent.osImplementations.title);
	});

	$.append($$anchor, div);
	$.pop();
}