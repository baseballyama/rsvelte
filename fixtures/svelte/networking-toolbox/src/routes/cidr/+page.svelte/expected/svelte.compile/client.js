import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SUB_NAV } from '$lib/constants/nav';
import { cidrContent } from '$lib/content/cidr';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import '../../styles/pages.scss';

var root = $.from_html(`<div class="concept-card svelte-r6risj"><div class="concept-header svelte-r6risj"><!> <h3 class="svelte-r6risj"> </h3></div> <p class="svelte-r6risj"> </p> <code class="concept-example svelte-r6risj"> </code></div>`);
var root_1 = $.from_html(`<strong>CIDR (Classless Inter-Domain Routing)</strong> `, 1);
var root_2 = $.from_html(`<p class="svelte-r6risj"><!></p>`);
var root_3 = $.from_html(`<div class="benefit-item svelte-r6risj"><strong class="svelte-r6risj"> </strong> </div>`);
var root_4 = $.from_html(`<tr class="size-row svelte-r6risj"><td class="cidr-cell svelte-r6risj"><strong class="svelte-r6risj"> </strong></td><td class="mask-cell svelte-r6risj"><code class="svelte-r6risj"> </code></td><td class="hosts-cell svelte-r6risj"> </td><td class="use-cell svelte-r6risj"> </td></tr>`);
var root_5 = $.from_html(`<div class="bit-example svelte-r6risj"><div class="network-bits svelte-r6risj"> </div> <div class="host-bits svelte-r6risj"> </div> <div class="labels svelte-r6risj"><span class="network-label svelte-r6risj"> </span> <span class="host-label svelte-r6risj"> </span></div></div>`);
var root_6 = $.from_html(` <br/>`, 1);
var root_7 = $.from_html(`<div class="before svelte-r6risj"><strong> </strong><br/> <!></div>`);
var root_8 = $.from_html(`<div class="after svelte-r6risj"><strong> </strong><br/> <!></div>`);
var root_9 = $.from_html(`<div class="summary-example svelte-r6risj"><!> <div class="arrow svelte-r6risj">→</div> <!></div>`);
var root_10 = $.from_html(`<div class="planning-tip svelte-r6risj"><strong class="svelte-r6risj"> </strong> </div>`);
var root_11 = $.from_html(`<div><h3 class="svelte-r6risj"> </h3> <p class="svelte-r6risj"> </p> <!></div>`);
var root_12 = $.from_html(`<li class="svelte-r6risj"> </li>`);
var root_13 = $.from_html(`<div class="reference-card no-hover svelte-r6risj"><h3 class="svelte-r6risj"> </h3> <ul class="svelte-r6risj"></ul></div>`);

var root_14 = $.from_html(`<div class="page-container"><header class="page-header"><h1>CIDR Tools & Converters</h1> <p class="page-description">Comprehensive CIDR tools for network analysis, conversion, and optimization. Convert between notation formats,
      summarize networks, split subnets, and perform set operations on IP ranges.</p></header> <!> <section class="concepts-section svelte-r6risj"><h2>Essential CIDR Concepts</h2> <div class="concepts-grid svelte-r6risj"></div></section> <section class="about-section svelte-r6risj"><h2>What is CIDR?</h2> <div class="about-grid svelte-r6risj"><div class="about-content svelte-r6risj"></div> <div class="benefits-list svelte-r6risj"><h3>Why CIDR Matters</h3> <!></div></div></section> <section class="sizes-section svelte-r6risj"><h2>Common CIDR Block Sizes</h2> <div class="sizes-table-wrapper svelte-r6risj"><table class="sizes-table svelte-r6risj"><thead><tr><th class="svelte-r6risj">CIDR</th><th class="svelte-r6risj">Subnet Mask</th><th class="svelte-r6risj">Hosts</th><th class="svelte-r6risj">Common Use</th></tr></thead><tbody></tbody></table></div> <p class="table-note svelte-r6risj"><strong>*</strong> /31 networks use special point-to-point addressing (RFC 3021) where both addresses are usable without
      network/broadcast addresses.</p></section> <section class="how-it-works svelte-r6risj"><h2>How CIDR Works</h2> <div class="explanation-grid svelte-r6risj"></div></section> <section class="quick-reference svelte-r6risj"><h2>Quick Reference</h2> <div class="reference-grid svelte-r6risj"></div></section></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Extract tools for CIDR section
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

	const cidrTools = extractNavItems(SUB_NAV['/cidr'] || []);
	var div = root_14();
	var node = $.sibling($.child(div), 2);

	ToolsGrid(node, {
		get tools() {
			return cidrTools;
		}
	});

	var section = $.sibling(node, 2);
	var div_1 = $.sibling($.child(section), 2);

	$.each(div_1, 21, () => cidrContent.coreConcepts, $.index, ($$anchor, concept) => {
		var div_2 = root();
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
		var code = $.sibling(p, 2);
		var text_2 = $.only_child(code, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_style(div_2, `--accent-color: ${$.get(concept).color ?? ''}`);
			$.set_text(text, $.get(concept).title);
			$.set_text(text_1, $.get(concept).description);
			$.set_text(text_2, $.get(concept).example);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.sibling($.child(section_1), 2);
	var div_5 = $.child(div_4);

	$.each(div_5, 21, () => cidrContent.aboutSection.content, $.index, ($$anchor, paragraph, i) => {
		var p_1 = root_2();
		var node_2 = $.child(p_1);

		{
			var consequent = ($$anchor) => {
				var fragment = root_1();
				var text_3 = $.sibling($.first_child(fragment));

				$.template_effect(($0) => $.set_text(text_3, ` ${$0 ?? ''}`), [
					() => $.get(paragraph).replace('CIDR (Classless Inter-Domain Routing) ', '')
				]);

				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var text_4 = $.text();

				$.template_effect(() => $.set_text(text_4, $.get(paragraph)));
				$.append($$anchor, text_4);
			};

			$.if(node_2, ($$render) => {
				if (i === 0) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(p_1);
		$.append($$anchor, p_1);
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.sibling($.child(div_6), 2);

	$.each(node_3, 17, () => cidrContent.aboutSection.advantages, $.index, ($$anchor, advantage) => {
		var div_7 = root_3();
		var strong = $.child(div_7);
		var text_5 = $.only_child(strong);
		var text_6 = $.sibling(strong);

		$.reset(div_7);

		$.template_effect(() => {
			$.set_text(text_5, `${$.get(advantage).title ?? ''}:`);
			$.set_text(text_6, ` ${$.get(advantage).description ?? ''}`);
		});

		$.append($$anchor, div_7);
	});

	$.reset(div_6);
	$.reset(div_4);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_8 = $.sibling($.child(section_2), 2);
	var table = $.child(div_8);
	var thead = $.child(table);
	var tr = $.child(thead);
	var th = $.child(tr);

	$.action(th, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'CIDR prefix length notation');

	var th_1 = $.sibling(th);

	$.action(th_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Traditional subnet mask notation');

	var th_2 = $.sibling(th_1);

	$.action(th_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of usable host addresses');

	var th_3 = $.sibling(th_2);

	$.action(th_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Typical use cases for this network size');
	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);

	$.each(tbody, 21, () => cidrContent.commonSizes, $.index, ($$anchor, size) => {
		var tr_1 = root_4();
		var td = $.child(tr_1);
		var strong_1 = $.child(td);
		var text_7 = $.only_child(strong_1, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_1 = $.child(td_1);
		var text_8 = $.only_child(code_1, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_9 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_10 = $.only_child(td_3, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_style(tr_1, `--row-color: ${$.get(size).color ?? ''}`);
			$.set_text(text_7, $.get(size).cidr);
			$.set_text(text_8, $.get(size).mask);
			$.set_text(text_9, $.get(size).hosts);
			$.set_text(text_10, $.get(size).use);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_8);
	$.next(2);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var div_9 = $.sibling($.child(section_3), 2);

	$.each(div_9, 21, () => cidrContent.howItWorks, $.index, ($$anchor, item) => {
		var div_10 = root_11();
		var h3_1 = $.child(div_10);
		var text_11 = $.only_child(h3_1, true);
		var p_2 = $.sibling(h3_1, 2);
		var text_12 = $.only_child(p_2, true);
		var node_4 = $.sibling(p_2, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_11 = root_5();
				var div_12 = $.child(div_11);
				var text_13 = $.only_child(div_12, true);
				var div_13 = $.sibling(div_12, 2);
				var text_14 = $.only_child(div_13, true);
				var div_14 = $.sibling(div_13, 2);
				var span = $.child(div_14);
				var text_15 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_16 = $.only_child(span_1, true);

				$.reset(div_14);
				$.reset(div_11);

				$.template_effect(() => {
					$.set_text(text_13, $.get(item).example.networkBits);
					$.set_text(text_14, $.get(item).example.hostBits);
					$.set_text(text_15, $.get(item).example.networkLabel);
					$.set_text(text_16, $.get(item).example.hostLabel);
				});

				$.append($$anchor, div_11);
			};

			var consequent_4 = ($$anchor) => {
				var div_15 = root_9();
				var node_5 = $.child(div_15);

				{
					var consequent_2 = ($$anchor) => {
						var div_16 = root_7();
						var strong_2 = $.child(div_16);
						var text_17 = $.only_child(strong_2, true);
						var node_6 = $.sibling(strong_2, 3);

						$.each(node_6, 17, () => $.get(item).example.before.content, $.index, ($$anchor, line, index, $$array) => {
							$.next();

							var fragment_2 = root_6();
							var text_18 = $.first_child(fragment_2, true);

							$.next();
							$.template_effect(() => $.set_text(text_18, $.get(line)));
							$.append($$anchor, fragment_2);
						});

						$.reset(div_16);
						$.template_effect(() => $.set_text(text_17, $.get(item).example.before.title));
						$.append($$anchor, div_16);
					};

					$.if(node_5, ($$render) => {
						if ($.get(item).example.before) $$render(consequent_2);
					});
				}

				var node_7 = $.sibling(node_5, 4);

				{
					var consequent_3 = ($$anchor) => {
						var div_17 = root_8();
						var strong_3 = $.child(div_17);
						var text_19 = $.only_child(strong_3, true);
						var node_8 = $.sibling(strong_3, 3);

						$.each(node_8, 17, () => $.get(item).example.after.content, $.index, ($$anchor, line, index, $$array_1) => {
							$.next();

							var fragment_3 = root_6();
							var text_20 = $.first_child(fragment_3, true);

							$.next();
							$.template_effect(() => $.set_text(text_20, $.get(line)));
							$.append($$anchor, fragment_3);
						});

						$.reset(div_17);
						$.template_effect(() => $.set_text(text_19, $.get(item).example.after.title));
						$.append($$anchor, div_17);
					};

					$.if(node_7, ($$render) => {
						if ($.get(item).example.after) $$render(consequent_3);
					});
				}

				$.reset(div_15);
				$.append($$anchor, div_15);
			};

			var consequent_5 = ($$anchor) => {
				var div_18 = root_10();
				var strong_4 = $.child(div_18);
				var text_21 = $.only_child(strong_4, true);
				var text_22 = $.sibling(strong_4);

				$.reset(div_18);

				$.template_effect(() => {
					$.set_text(text_21, $.get(item).example.title);
					$.set_text(text_22, ` ${$.get(item).example.content ?? ''}`);
				});

				$.append($$anchor, div_18);
			};

			$.if(node_4, ($$render) => {
				if ($.get(item).example.type === 'bit') $$render(consequent_1); else if ($.get(item).example.type === 'summary') $$render(consequent_4, 1); else if ($.get(item).example.type === 'tip') $$render(consequent_5, 2);
			});
		}

		$.reset(div_10);

		$.template_effect(() => {
			$.set_class(div_10, 1, `explanation-item ${$.get(item).type ?? ''}`, 'svelte-r6risj');
			$.set_text(text_11, $.get(item).title);
			$.set_text(text_12, $.get(item).content);
		});

		$.append($$anchor, div_10);
	});

	$.reset(div_9);
	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var div_19 = $.sibling($.child(section_4), 2);

	$.each(div_19, 21, () => cidrContent.quickReference, $.index, ($$anchor, card) => {
		var div_20 = root_13();
		var h3_2 = $.child(div_20);
		var text_23 = $.only_child(h3_2, true);
		var ul = $.sibling(h3_2, 2);

		$.each(ul, 21, () => $.get(card).items, $.index, ($$anchor, item, index, $$array_2) => {
			var li = root_12();
			var text_24 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_24, $.get(item)));
			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_20);
		$.template_effect(() => $.set_text(text_23, $.get(card).title));
		$.append($$anchor, div_20);
	});

	$.reset(div_19);
	$.reset(section_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}