import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

import {
	commonSubnetMasks,
	keyConcepts,
	subnettingTechniques,
	practicalTips,
	commonMistakes
} from '$lib/content/subnetting';

import '../../styles/pages.scss';

var root = $.from_html(`<code class="concept-example svelte-1novvv6"> </code>`);
var root_1 = $.from_html(`<div class="concept-card svelte-1novvv6"><div class="concept-header svelte-1novvv6"><!> <h3 class="svelte-1novvv6"> </h3></div> <p class="svelte-1novvv6"> </p> <!></div>`);
var root_2 = $.from_html(`<div class="technique-card svelte-1novvv6"><div class="technique-header svelte-1novvv6"><!> <h3 class="svelte-1novvv6"> </h3></div> <p class="technique-description svelte-1novvv6"> </p> <div class="technique-use-case svelte-1novvv6"><strong class="svelte-1novvv6">Best for:</strong> </div></div>`);
var root_3 = $.from_html(`<tr class="svelte-1novvv6"><td class="cidr-cell svelte-1novvv6"> </td><td class="mask-cell svelte-1novvv6"> </td><td class="hosts-cell svelte-1novvv6"> </td><td class="networks-cell svelte-1novvv6"> </td></tr>`);
var root_4 = $.from_html(`<li class="svelte-1novvv6"> </li>`);

var root_5 = $.from_html(`<div class="page-container"><header class="page-header"><h1>Subnetting Tools</h1> <p class="page-description">Divide networks efficiently, optimize address allocation, and master network design with our comprehensive
      subnetting toolkit.</p></header> <!> <hr class="section-divider"/> <h2 class="svelte-1novvv6">What's Subnetting?</h2> <section class="intro-card svelte-1novvv6"><p class="svelte-1novvv6">Subnetting is the process of splitting a large network into smaller, easier-to-manage pieces. Each subnet has its
      own network address and range of IPs, which helps organize devices, improve security, and reduce wasted addresses.
      It's core to network planning (both small home labs, or managing a large office or campus).</p> <p class="tools-intro svelte-1novvv6">These tools aim to make this easier for you, handling the math and planning for you. They calculate network and
      broadcast addresses, host ranges, and help design or summarize networks so you can focus on building, not IP
      crunching.</p></section> <section class="concepts-section svelte-1novvv6"><h2 class="svelte-1novvv6">Essential Concepts</h2> <div class="concepts-grid svelte-1novvv6"></div></section> <section class="techniques-section svelte-1novvv6"><h2 class="svelte-1novvv6">Subnetting Techniques</h2> <div class="techniques-grid svelte-1novvv6"></div></section> <section class="masks-section svelte-1novvv6"><h2 class="svelte-1novvv6">Common Subnet Masks</h2> <div class="masks-table-wrapper svelte-1novvv6"><table class="masks-table svelte-1novvv6"><thead><tr><th class="svelte-1novvv6">CIDR</th><th class="svelte-1novvv6">Subnet Mask</th><th class="svelte-1novvv6">Hosts</th><th class="svelte-1novvv6">Subnets</th></tr></thead><tbody></tbody></table></div></section> <div class="tips-grid svelte-1novvv6"><section class="tips-card svelte-1novvv6"><div class="tips-header svelte-1novvv6"><!> <h2 class="svelte-1novvv6">Best Practices</h2></div> <ul class="svelte-1novvv6"></ul></section> <section class="mistakes-card svelte-1novvv6"><div class="mistakes-header svelte-1novvv6"><!> <h2 class="svelte-1novvv6">Common Mistakes</h2></div> <ul class="svelte-1novvv6"></ul></section></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Extract tools for subnetting section
	function extractNavItems(items) {
		const navItems = [];

		for (const item of items) {
			if ('href' in item) {
				navItems.push(item);
			} else if ('title' in item && 'items' in item) {
				navItems.push(...item.items);
			}
		}

		return navItems;
	}

	const subnettingTools = extractNavItems(SUB_NAV['/subnetting'] || []);

	function formatNumber(num) {
		return num.toLocaleString();
	}

	var div = root_5();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return subnettingTools;
		}
	});

	var section = $.sibling(node, 8);
	var div_1 = $.sibling($.child(section), 2);

	$.each(div_1, 21, () => keyConcepts, (concept) => concept.title, ($$anchor, concept) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var node_1 = $.child(div_3);

		Icon(node_1, {
			get name() {
				return $.get(concept).icon;
			},
			size: 'md'
		});

		var h3 = $.sibling(node_1, 2);
		var text = $.only_child(h3, true);

		$.reset(div_3);

		var p = $.sibling(div_3, 2);
		var text_1 = $.only_child(p, true);
		var node_2 = $.sibling(p, 2);

		{
			var consequent = ($$anchor) => {
				var code = root();
				var text_2 = $.only_child(code, true);

				$.template_effect(() => $.set_text(text_2, $.get(concept).example));
				$.append($$anchor, code);
			};

			$.if(node_2, ($$render) => {
				if ($.get(concept).example) $$render(consequent);
			});
		}

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(concept).title);
			$.set_text(text_1, $.get(concept).description);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.sibling($.child(section_1), 2);

	$.each(div_4, 21, () => subnettingTechniques, (technique) => technique.name, ($$anchor, technique) => {
		var div_5 = root_2();
		var div_6 = $.child(div_5);
		var node_3 = $.child(div_6);

		Icon(node_3, {
			get name() {
				return $.get(technique).icon;
			},
			size: 'lg'
		});

		var h3_1 = $.sibling(node_3, 2);
		var text_3 = $.only_child(h3_1, true);

		$.reset(div_6);

		var p_1 = $.sibling(div_6, 2);
		var text_4 = $.only_child(p_1, true);
		var div_7 = $.sibling(p_1, 2);
		var text_5 = $.sibling($.child(div_7));

		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_style(div_5, `--accent-color: ${$.get(technique).color ?? ''}`);
			$.set_text(text_3, $.get(technique).name);
			$.set_text(text_4, $.get(technique).description);
			$.set_text(text_5, ` ${$.get(technique).useCase ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_8 = $.sibling($.child(section_2), 2);
	var table = $.child(div_8);
	var thead = $.child(table);
	var tr = $.child(thead);
	var th = $.child(tr);

	$.action(th, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'CIDR notation - number of network bits');

	var th_1 = $.sibling(th);

	$.action(th_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Decimal representation of the subnet mask');

	var th_2 = $.sibling(th_1);

	$.action(th_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of usable host addresses per subnet');

	var th_3 = $.sibling(th_2);

	$.action(th_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of possible subnets in a /24 network');
	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);

	$.each(tbody, 21, () => commonSubnetMasks, (mask) => mask.cidr, ($$anchor, mask) => {
		var tr_1 = root_3();
		var td = $.child(tr_1);
		var text_6 = $.only_child(td);
		var td_1 = $.sibling(td);
		var text_7 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_8 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_9 = $.only_child(td_3, true);

		$.reset(tr_1);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_6, `/${$.get(mask).cidr ?? ''}`);
				$.set_text(text_7, $.get(mask).decimal);
				$.set_text(text_8, $0);
				$.set_text(text_9, $1);
			},
			[
				() => formatNumber($.get(mask).hosts),
				() => formatNumber($.get(mask).networks)
			]
		);

		$.append($$anchor, tr_1);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_8);
	$.reset(section_2);

	var div_9 = $.sibling(section_2, 2);
	var section_3 = $.child(div_9);
	var div_10 = $.child(section_3);
	var node_4 = $.child(div_10);

	Icon(node_4, { name: 'lightbulb', size: 'md' });
	$.next(2);
	$.reset(div_10);

	var ul = $.sibling(div_10, 2);

	$.each(ul, 20, () => practicalTips, (tip) => tip, ($$anchor, tip) => {
		var li = root_4();
		var text_10 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_10, tip));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var div_11 = $.child(section_4);
	var node_5 = $.child(div_11);

	Icon(node_5, { name: 'alert-triangle', size: 'md' });
	$.next(2);
	$.reset(div_11);

	var ul_1 = $.sibling(div_11, 2);

	$.each(ul_1, 20, () => commonMistakes, (mistake) => mistake, ($$anchor, mistake) => {
		var li_1 = root_4();
		var text_11 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_11, mistake));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(section_4);
	$.reset(div_9);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}