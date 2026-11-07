import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { arpVsNdpContent } from '$lib/content/arp-vs-ndp.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<tr><td><strong> </strong></td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Description:</strong> </div> <div><strong>Destination:</strong> </div> <div><strong>Response:</strong> </div></div></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>ICMP Type:</strong> <code> </code></div> <div><strong>Description:</strong> </div> <div><strong>Destination:</strong> </div> <div><strong>Purpose:</strong> </div></div></div>`);
var root_4 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>ARP (IPv4):</strong> </div> <div><strong>NDP (IPv6):</strong> </div> <div><strong>Impact:</strong> </div></div></div>`);
var root_5 = $.from_html(`<tr><td><strong> </strong></td><td><code> </code></td><td><code style="font-size: 0.8em;"> </code></td><td><code style="font-size: 0.8em;"> </code></td></tr>`);
var root_6 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Description:</strong> </p> <p><strong>Detection:</strong> </p> <p><strong>Mitigation:</strong> </p></div></div>`);
var root_7 = $.from_html(`<h3> </h3> <ul></ul>`, 1);
var root_8 = $.from_html(`<div class="item-code"> </div>`);
var root_9 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_10 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Side-by-Side Comparison</h2> <table class="ref-table"><thead><tr><th>Aspect</th><th>ARP (IPv4)</th><th>NDP (IPv6)</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <h3>ARP Message Types</h3> <!> <h3>ARP Process</h3> <ol></ol> <h3>ARP Limitations</h3> <ul></ul></div> <div class="ref-section"><h2> </h2> <h3>NDP Message Types</h3> <!> <h3>NDP Process</h3> <ol></ol> <h3>NDP Advantages Over ARP</h3> <ul></ul></div> <div class="ref-section"><h2>Practical Differences</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Purpose</th><th>IPv4 (ARP)</th><th>IPv6 (NDP)</th><th>Windows</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Common Issues</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <!></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">ARP Key Points</div> <!></div> <div class="grid-item"><div class="item-title">NDP Key Points</div> <!></div></div></div> <div class="ref-section"><h2>IPv4 to IPv6 Migration Tips</h2> <div class="ref-examples"><div class="examples-title">Important Considerations</div> <!></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Takeaway</div> <div class="highlight-content">While NDP is more complex than ARP, it's also much more capable and efficient. Understanding both protocols is
          essential for mixed IPv4/IPv6 environments.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_10();
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
	var table = $.sibling($.child(div_4), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => arpVsNdpContent.comparison.basic, (item, index) => `${item.aspect}-${index}`, ($$anchor, item) => {
		var tr = root();
		var td = $.child(tr);
		var strong = $.child(td);
		var text_4 = $.only_child(strong, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_5 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_6 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_4, $.get(item).aspect);
			$.set_text(text_5, $.get(item).arp);
			$.set_text(text_6, $.get(item).ndp);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var h2_1 = $.child(div_5);
	var text_7 = $.only_child(h2_1, true);
	var node = $.sibling(h2_1, 4);

	$.each(node, 19, () => arpVsNdpContent.arpDetails.messageTypes, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_6 = root_1();
		var div_7 = $.child(div_6);
		var text_8 = $.only_child(div_7, true);
		var div_8 = $.sibling(div_7, 2);
		var div_9 = $.child(div_8);
		var text_9 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_10 = $.sibling($.child(div_10));

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_11 = $.sibling($.child(div_11));

		$.reset(div_11);
		$.reset(div_8);
		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_8, $.get(type).type);
			$.set_text(text_9, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_10, ` ${$.get(type).destination ?? ''}`);
			$.set_text(text_11, ` ${$.get(type).response ?? ''}`);
		});

		$.append($$anchor, div_6);
	});

	var ol = $.sibling(node, 4);

	$.each(ol, 23, () => arpVsNdpContent.arpDetails.process, (step, index) => `arp-process-${index}`, ($$anchor, step) => {
		var li = root_2();
		var text_12 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_12, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var ul = $.sibling(ol, 4);

	$.each(ul, 23, () => arpVsNdpContent.arpDetails.limitations, (limitation, index) => `arp-limitation-${index}`, ($$anchor, limitation) => {
		var li_1 = root_2();
		var text_13 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_13, $.get(limitation)));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div_5);

	var div_12 = $.sibling(div_5, 2);
	var h2_2 = $.child(div_12);
	var text_14 = $.only_child(h2_2, true);
	var node_1 = $.sibling(h2_2, 4);

	$.each(node_1, 19, () => arpVsNdpContent.ndpDetails.messageTypes, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_13 = root_3();
		var div_14 = $.child(div_13);
		var text_15 = $.only_child(div_14, true);
		var div_15 = $.sibling(div_14, 2);
		var div_16 = $.child(div_15);
		var code = $.sibling($.child(div_16), 2);
		var text_16 = $.only_child(code, true);

		$.reset(div_16);

		var div_17 = $.sibling(div_16, 2);
		var text_17 = $.sibling($.child(div_17));

		$.reset(div_17);

		var div_18 = $.sibling(div_17, 2);
		var text_18 = $.sibling($.child(div_18));

		$.reset(div_18);

		var div_19 = $.sibling(div_18, 2);
		var text_19 = $.sibling($.child(div_19));

		$.reset(div_19);
		$.reset(div_15);
		$.reset(div_13);

		$.template_effect(() => {
			$.set_text(text_15, $.get(type).type);
			$.set_text(text_16, $.get(type).icmpType);
			$.set_text(text_17, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_18, ` ${$.get(type).destination ?? ''}`);
			$.set_text(text_19, ` ${$.get(type).purpose ?? ''}`);
		});

		$.append($$anchor, div_13);
	});

	var ol_1 = $.sibling(node_1, 4);

	$.each(ol_1, 23, () => arpVsNdpContent.ndpDetails.process, (step, index) => `ndp-process-${index}`, ($$anchor, step) => {
		var li_2 = root_2();
		var text_20 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_20, $.get(step)));
		$.append($$anchor, li_2);
	});

	$.reset(ol_1);

	var ul_1 = $.sibling(ol_1, 4);

	$.each(ul_1, 23, () => arpVsNdpContent.ndpDetails.advantages, (advantage, index) => `ndp-advantage-${index}`, ($$anchor, advantage) => {
		var li_3 = root_2();
		var text_21 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_21, $.get(advantage)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_1);
	$.reset(div_12);

	var div_20 = $.sibling(div_12, 2);
	var node_2 = $.sibling($.child(div_20), 2);

	$.each(node_2, 19, () => arpVsNdpContent.practicalDifferences, (diff, index) => `${diff.scenario}-${index}`, ($$anchor, diff) => {
		var div_21 = root_4();
		var div_22 = $.child(div_21);
		var text_22 = $.only_child(div_22, true);
		var div_23 = $.sibling(div_22, 2);
		var div_24 = $.child(div_23);
		var text_23 = $.sibling($.child(div_24));

		$.reset(div_24);

		var div_25 = $.sibling(div_24, 2);
		var text_24 = $.sibling($.child(div_25));

		$.reset(div_25);

		var div_26 = $.sibling(div_25, 2);
		var text_25 = $.sibling($.child(div_26));

		$.reset(div_26);
		$.reset(div_23);
		$.reset(div_21);

		$.template_effect(() => {
			$.set_text(text_22, $.get(diff).scenario);
			$.set_text(text_23, ` ${$.get(diff).arp ?? ''}`);
			$.set_text(text_24, ` ${$.get(diff).ndp ?? ''}`);
			$.set_text(text_25, ` ${$.get(diff).impact ?? ''}`);
		});

		$.append($$anchor, div_21);
	});

	$.reset(div_20);

	var div_27 = $.sibling(div_20, 2);
	var table_1 = $.sibling($.child(div_27), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => arpVsNdpContent.troubleshootingCommands, (cmd, index) => `${cmd.purpose}-${index}`, ($$anchor, cmd) => {
		var tr_1 = root_5();
		var td_3 = $.child(tr_1);
		var strong_1 = $.child(td_3);
		var text_26 = $.only_child(strong_1, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var code_1 = $.child(td_4);
		var text_27 = $.only_child(code_1, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_2 = $.child(td_5);
		var text_28 = $.only_child(code_2, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var code_3 = $.child(td_6);
		var text_29 = $.only_child(code_3, true);

		$.reset(td_6);
		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_26, $.get(cmd).purpose);
			$.set_text(text_27, $.get(cmd).ipv4);
			$.set_text(text_28, $.get(cmd).ipv6);
			$.set_text(text_29, $.get(cmd).windows);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var node_3 = $.sibling($.child(div_28), 2);

	$.each(node_3, 19, () => arpVsNdpContent.commonIssues, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_29 = root_6();
		var div_30 = $.child(div_29);
		var node_4 = $.child(div_30);

		Icon(node_4, { name: 'alert-triangle', size: 'sm' });

		var text_30 = $.sibling(node_4);

		$.reset(div_30);

		var div_31 = $.sibling(div_30, 2);
		var p_2 = $.child(div_31);
		var text_31 = $.sibling($.child(p_2));

		$.reset(p_2);

		var p_3 = $.sibling(p_2, 2);
		var text_32 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_33 = $.sibling($.child(p_4));

		$.reset(p_4);
		$.reset(div_31);
		$.reset(div_29);

		$.template_effect(() => {
			$.set_text(text_30, ` ${$.get(issue).issue ?? ''} (${$.get(issue).protocol ?? ''})`);
			$.set_text(text_31, ` ${$.get(issue).description ?? ''}`);
			$.set_text(text_32, ` ${$.get(issue).detection ?? ''}`);
			$.set_text(text_33, ` ${$.get(issue).mitigation ?? ''}`);
		});

		$.append($$anchor, div_29);
	});

	$.reset(div_28);

	var div_32 = $.sibling(div_28, 2);
	var node_5 = $.sibling($.child(div_32), 2);

	$.each(node_5, 19, () => arpVsNdpContent.bestPractices, (practices, index) => `${practices.protocol}-${index}`, ($$anchor, practices) => {
		var fragment = root_7();
		var h3 = $.first_child(fragment);
		var text_34 = $.only_child(h3);
		var ul_2 = $.sibling(h3, 2);

		$.each(ul_2, 23, () => $.get(practices).practices, (practice, index) => `practice-${index}`, ($$anchor, practice, index, $$array) => {
			var li_4 = root_2();
			var text_35 = $.only_child(li_4, true);

			$.template_effect(() => $.set_text(text_35, $.get(practice)));
			$.append($$anchor, li_4);
		});

		$.reset(ul_2);
		$.template_effect(() => $.set_text(text_34, `${$.get(practices).protocol ?? ''} Best Practices`));
		$.append($$anchor, fragment);
	});

	$.reset(div_32);

	var div_33 = $.sibling(div_32, 2);
	var div_34 = $.sibling($.child(div_33), 2);
	var div_35 = $.child(div_34);
	var node_6 = $.sibling($.child(div_35), 2);

	$.each(node_6, 19, () => arpVsNdpContent.quickReference.arp, (point, index) => `arp-point-${index}`, ($$anchor, point) => {
		var div_36 = root_8();
		var text_36 = $.only_child(div_36, true);

		$.template_effect(() => $.set_text(text_36, $.get(point)));
		$.append($$anchor, div_36);
	});

	$.reset(div_35);

	var div_37 = $.sibling(div_35, 2);
	var node_7 = $.sibling($.child(div_37), 2);

	$.each(node_7, 19, () => arpVsNdpContent.quickReference.ndp, (point, index) => `ndp-point-${index}`, ($$anchor, point) => {
		var div_38 = root_8();
		var text_37 = $.only_child(div_38, true);

		$.template_effect(() => $.set_text(text_37, $.get(point)));
		$.append($$anchor, div_38);
	});

	$.reset(div_37);
	$.reset(div_34);
	$.reset(div_33);

	var div_39 = $.sibling(div_33, 2);
	var div_40 = $.sibling($.child(div_39), 2);
	var node_8 = $.sibling($.child(div_40), 2);

	$.each(node_8, 19, () => arpVsNdpContent.migrationTips, (tip, index) => `migration-tip-${index}`, ($$anchor, tip) => {
		var div_41 = root_9();
		var div_42 = $.child(div_41);
		var text_38 = $.only_child(div_42, true);

		$.reset(div_41);
		$.template_effect(() => $.set_text(text_38, $.get(tip)));
		$.append($$anchor, div_41);
	});

	$.reset(div_40);

	var div_43 = $.sibling(div_40, 2);
	var div_44 = $.child(div_43);
	var node_9 = $.child(div_44);

	Icon(node_9, { name: 'arrow-right', size: 'sm' });
	$.next();
	$.reset(div_44);
	$.next(2);
	$.reset(div_43);
	$.reset(div_39);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, arpVsNdpContent.title);
		$.set_text(text_1, arpVsNdpContent.description);
		$.set_text(text_2, arpVsNdpContent.sections.overview.title);
		$.set_text(text_3, arpVsNdpContent.sections.overview.content);
		$.set_text(text_7, arpVsNdpContent.arpDetails.title);
		$.set_text(text_14, arpVsNdpContent.ndpDetails.title);
	});

	$.append($$anchor, div);
	$.pop();
}