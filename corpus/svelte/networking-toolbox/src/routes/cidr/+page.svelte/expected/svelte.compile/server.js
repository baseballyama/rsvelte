import * as $ from 'svelte/internal/server';
import { SUB_NAV } from '$lib/constants/nav';
import { cidrContent } from '$lib/content/cidr';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import '../../styles/pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="page-container"><header class="page-header"><h1>CIDR Tools &amp; Converters</h1> <p class="page-description">Comprehensive CIDR tools for network analysis, conversion, and optimization. Convert between notation formats,
      summarize networks, split subnets, and perform set operations on IP ranges.</p></header> `);

		ToolsGrid($$renderer, { tools: cidrTools });
		$$renderer.push(`<!----> <section class="concepts-section svelte-r6risj"><h2>Essential CIDR Concepts</h2> <div class="concepts-grid svelte-r6risj"><!--[-->`);

		const each_array = $.ensure_array_like(cidrContent.coreConcepts);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let concept = each_array[index];

			$$renderer.push(`<div class="concept-card svelte-r6risj"${$.attr_style(`--accent-color: ${$.stringify(concept.color)}`)}><div class="concept-header svelte-r6risj">`);
			Icon($$renderer, { name: concept.icon, size: 'md' });
			$$renderer.push(`<!----> <h3 class="svelte-r6risj">${$.escape(concept.title)}</h3></div> <p class="svelte-r6risj">${$.escape(concept.description)}</p> <code class="concept-example svelte-r6risj">${$.escape(concept.example)}</code></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="about-section svelte-r6risj"><h2>What is CIDR?</h2> <div class="about-grid svelte-r6risj"><div class="about-content svelte-r6risj"><!--[-->`);

		const each_array_1 = $.ensure_array_like(cidrContent.aboutSection.content);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let paragraph = each_array_1[i];

			$$renderer.push(`<p class="svelte-r6risj">`);

			if (i === 0) {
				$$renderer.push(`<!--[0--><strong>CIDR (Classless Inter-Domain Routing)</strong> ${$.escape(paragraph.replace('CIDR (Classless Inter-Domain Routing) ', ''))}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(paragraph)}`);
			}

			$$renderer.push(`<!--]--></p>`);
		}

		$$renderer.push(`<!--]--></div> <div class="benefits-list svelte-r6risj"><h3>Why CIDR Matters</h3> <!--[-->`);

		const each_array_2 = $.ensure_array_like(cidrContent.aboutSection.advantages);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let advantage = each_array_2[index];

			$$renderer.push(`<div class="benefit-item svelte-r6risj"><strong class="svelte-r6risj">${$.escape(advantage.title)}:</strong> ${$.escape(advantage.description)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="sizes-section svelte-r6risj"><h2>Common CIDR Block Sizes</h2> <div class="sizes-table-wrapper svelte-r6risj"><table class="sizes-table svelte-r6risj"><thead><tr><th class="svelte-r6risj">CIDR</th><th class="svelte-r6risj">Subnet Mask</th><th class="svelte-r6risj">Hosts</th><th class="svelte-r6risj">Common Use</th></tr></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(cidrContent.commonSizes);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let size = each_array_3[index];

			$$renderer.push(`<tr class="size-row svelte-r6risj"${$.attr_style(`--row-color: ${$.stringify(size.color)}`)}><td class="cidr-cell svelte-r6risj"><strong class="svelte-r6risj">${$.escape(size.cidr)}</strong></td><td class="mask-cell svelte-r6risj"><code class="svelte-r6risj">${$.escape(size.mask)}</code></td><td class="hosts-cell svelte-r6risj">${$.escape(size.hosts)}</td><td class="use-cell svelte-r6risj">${$.escape(size.use)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <p class="table-note svelte-r6risj"><strong>*</strong> /31 networks use special point-to-point addressing (RFC 3021) where both addresses are usable without
      network/broadcast addresses.</p></section> <section class="how-it-works svelte-r6risj"><h2>How CIDR Works</h2> <div class="explanation-grid svelte-r6risj"><!--[-->`);

		const each_array_4 = $.ensure_array_like(cidrContent.howItWorks);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let item = each_array_4[index];

			$$renderer.push(`<div${$.attr_class(`explanation-item ${$.stringify(item.type)}`, 'svelte-r6risj')}><h3 class="svelte-r6risj">${$.escape(item.title)}</h3> <p class="svelte-r6risj">${$.escape(item.content)}</p> `);

			if (item.example.type === 'bit') {
				$$renderer.push(`<!--[0--><div class="bit-example svelte-r6risj"><div class="network-bits svelte-r6risj">${$.escape(item.example.networkBits)}</div> <div class="host-bits svelte-r6risj">${$.escape(item.example.hostBits)}</div> <div class="labels svelte-r6risj"><span class="network-label svelte-r6risj">${$.escape(item.example.networkLabel)}</span> <span class="host-label svelte-r6risj">${$.escape(item.example.hostLabel)}</span></div></div>`);
			} else if (item.example.type === 'summary') {
				$$renderer.push(`<!--[1--><div class="summary-example svelte-r6risj">`);

				if (item.example.before) {
					$$renderer.push(`<!--[0--><div class="before svelte-r6risj"><strong>${$.escape(item.example.before.title)}</strong><br/> <!--[-->`);

					const each_array_5 = $.ensure_array_like(item.example.before.content);

					for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
						let line = each_array_5[index];

						$$renderer.push(`<!---->${$.escape(line)}<br/>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="arrow svelte-r6risj">→</div> `);

				if (item.example.after) {
					$$renderer.push(`<!--[0--><div class="after svelte-r6risj"><strong>${$.escape(item.example.after.title)}</strong><br/> <!--[-->`);

					const each_array_6 = $.ensure_array_like(item.example.after.content);

					for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
						let line = each_array_6[index];

						$$renderer.push(`<!---->${$.escape(line)}<br/>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else if (item.example.type === 'tip') {
				$$renderer.push(`<!--[2--><div class="planning-tip svelte-r6risj"><strong class="svelte-r6risj">${$.escape(item.example.title)}</strong> ${$.escape(item.example.content)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="quick-reference svelte-r6risj"><h2>Quick Reference</h2> <div class="reference-grid svelte-r6risj"><!--[-->`);

		const each_array_7 = $.ensure_array_like(cidrContent.quickReference);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let card = each_array_7[index];

			$$renderer.push(`<div class="reference-card no-hover svelte-r6risj"><h3 class="svelte-r6risj">${$.escape(card.title)}</h3> <ul class="svelte-r6risj"><!--[-->`);

			const each_array_8 = $.ensure_array_like(card.items);

			for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
				let item = each_array_8[index];

				$$renderer.push(`<li class="svelte-r6risj">${$.escape(item)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		$$renderer.push(`<!--]--></div></section></div>`);
	});
}