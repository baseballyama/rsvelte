import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { bgpContent } from '$lib/content/bgp';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let resource = '8.8.8.8';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{
				resource: '8.8.8.8',
				description: 'Google Public DNS (AS15169)'
			},
			{ resource: '1.1.1.1', description: 'Cloudflare DNS (AS13335)' },
			{ resource: '104.244.42.1', description: 'Twitter/X' },
			{ resource: '140.82.121.4', description: 'GitHub (AS36459)' },
			{
				resource: '91.189.88.152',
				description: 'Canonical/Ubuntu servers'
			}
		];

		async function lookupBGP() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/bgp', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ resource: resource.trim() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `BGP lookup failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			resource = example.resource;
			selectedExampleIndex = index;
			lookupBGP();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		async function copyResults() {
			if (!results) return;

			let text = `BGP Route Lookup for ${results.resource}\n`;

			text += `Generated at: ${results.timestamp}\n\n`;

			if (results.announced) {
				text += `Status: Announced in BGP\n`;
			} else {
				text += `Status: Not announced in BGP\n`;
			}

			if (results.originAS) {
				text += `\nOrigin AS: AS${results.originAS}\n`;

				if (results.originName) {
					text += `Origin Name: ${results.originName}\n`;
				}
			}

			if (results.asPath) {
				text += `\nAS Path: ${results.asPath.path.join(' ')}\n`;
			}

			if (results.prefixes.length > 0) {
				text += `\nPrefixes (${results.prefixes.length}):\n`;

				results.prefixes.forEach((prefix) => {
					text += `  ${prefix.prefix} - AS${prefix.asn} (${prefix.holder})`;

					if (prefix.country) text += ` [${prefix.country}]`;

					text += '\n';
				});
			}

			if (results.peers.length > 0) {
				text += `\nPeers (${results.peers.length}):\n`;

				results.peers.forEach((peer) => {
					text += `  AS${peer.asn}`;

					if (peer.country) text += ` [${peer.country}]`;

					text += '\n';
				});
			}

			await navigator.clipboard.writeText(text);
			copiedState = true;
			setTimeout(() => copiedState = false, 1500);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(bgpContent.title)}</h1> <p>${$.escape(bgpContent.description)}</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Example Lookups</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.resource)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>BGP Lookup</h3></div> <div class="card-content"><div class="lookup-form svelte-1gwrbdt"><label for="resource" class="svelte-1gwrbdt">IP Address or Prefix</label> <div class="input-row svelte-1gwrbdt"><input id="resource" type="text"${$.attr('value', resource)} placeholder="8.8.8.8 or 8.8.8.0/24" class="svelte-1gwrbdt"/> <button class="lookup-btn svelte-1gwrbdt"${$.attr('disabled', loading || !resource.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Looking up...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Lookup`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>BGP Routing Information for ${$.escape(results.resource)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(copiedState ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="status-overview"><div${$.attr_class(`status-item ${results.announced ? 'success' : 'warning'}`, 'svelte-1gwrbdt')}>`);

			Icon($$renderer, {
				name: results.announced ? 'check-circle' : 'alert-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <div><h4 class="svelte-1gwrbdt">${$.escape(results.announced ? 'Announced in BGP' : 'Not Announced')}</h4> <p class="svelte-1gwrbdt">${$.escape(results.announced
				? 'This resource is actively advertised in the global BGP routing table'
				: 'This resource is not currently visible in BGP')}</p></div></div></div> <div class="results-grid svelte-1gwrbdt">`);

			if (results.originAS) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Origin Autonomous System</h4> <div class="origin-as-content svelte-1gwrbdt">`);
				Icon($$renderer, { name: 'building', size: 'md' });
				$$renderer.push(`<!----> <div><div class="asn-badge svelte-1gwrbdt">AS${$.escape(results.originAS)}</div> `);

				if (results.originName) {
					$$renderer.push(`<!--[0--><div class="asn-name svelte-1gwrbdt">${$.escape(results.originName)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.asPath && results.asPath.path.length > 0) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">AS Path</h4> <div class="as-path-display svelte-1gwrbdt"><!--[-->`);

				const each_array_1 = $.ensure_array_like(results.asPath.path);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let asn = each_array_1[index];

					$$renderer.push(`<span class="as-path-segment svelte-1gwrbdt"><span class="asn-label svelte-1gwrbdt">AS${$.escape(asn)}</span> `);

					if (index < results.asPath.path.length - 1) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'chevron-right', size: 'xs' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></span>`);
				}

				$$renderer.push(`<!--]--></div> <div class="path-info svelte-1gwrbdt"><small>Path length: ${$.escape(results.asPath.path.length)} hops</small></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.prefixes.length > 0) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">BGP Prefixes (${$.escape(results.prefixes.length)})</h4> <!--[-->`);

				const each_array_2 = $.ensure_array_like(results.prefixes);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let prefix = each_array_2[index];

					$$renderer.push(`<div class="prefix-content svelte-1gwrbdt"><div class="prefix-header svelte-1gwrbdt">`);
					Icon($$renderer, { name: 'map', size: 'sm' });
					$$renderer.push(`<!----> <span class="prefix-value svelte-1gwrbdt">${$.escape(prefix.prefix)}</span></div> <div class="prefix-details svelte-1gwrbdt"><div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">ASN:</span> <span class="detail-value svelte-1gwrbdt">AS${$.escape(prefix.asn)}</span></div> <div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">Holder:</span> <span class="detail-value svelte-1gwrbdt">${$.escape(prefix.holder)}</span></div> `);

					if (prefix.country) {
						$$renderer.push(`<!--[0--><div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">Country:</span> <span class="detail-value svelte-1gwrbdt">${$.escape(prefix.country)}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.peers && results.peers.length > 0) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">BGP Peers (${$.escape(results.peers.length)})</h4> <div class="peers-list svelte-1gwrbdt"><!--[-->`);

				const each_array_3 = $.ensure_array_like(results.peers.slice(0, 8));

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let peer = each_array_3[index];

					$$renderer.push(`<div class="peer-badge svelte-1gwrbdt"><span class="peer-asn svelte-1gwrbdt">AS${$.escape(peer.asn)}</span> `);

					if (peer.country) {
						$$renderer.push(`<!--[0--><span class="peer-country svelte-1gwrbdt">${$.escape(peer.country)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.moreSpecifics && results.moreSpecifics.length > 0 || results.lessSpecifics && results.lessSpecifics.length > 0) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Related Prefixes</h4> <div class="related-prefixes svelte-1gwrbdt">`);

				if (results.moreSpecifics && results.moreSpecifics.length > 0) {
					$$renderer.push(`<!--[0--><div class="prefix-list svelte-1gwrbdt"><h5 class="svelte-1gwrbdt">More Specific (${$.escape(results.moreSpecifics.length)})</h5> <div class="prefix-tags svelte-1gwrbdt"><!--[-->`);

					const each_array_4 = $.ensure_array_like(results.moreSpecifics);

					for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
						let prefix = each_array_4[index];

						$$renderer.push(`<span class="prefix-tag more-specific svelte-1gwrbdt">${$.escape(prefix)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.lessSpecifics && results.lessSpecifics.length > 0) {
					$$renderer.push(`<!--[0--><div class="prefix-list svelte-1gwrbdt"><h5 class="svelte-1gwrbdt">Less Specific (${$.escape(results.lessSpecifics.length)})</h5> <div class="prefix-tags svelte-1gwrbdt"><!--[-->`);

					const each_array_5 = $.ensure_array_like(results.lessSpecifics);

					for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
						let prefix = each_array_5[index];

						$$renderer.push(`<span class="prefix-tag less-specific svelte-1gwrbdt">${$.escape(prefix)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>BGP Lookup Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card svelte-1gwrbdt"><div class="card-header"><h3>About BGP Routing</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>${$.escape(bgpContent.sections.whatIsBGP.title)}</h4> <p>${$.escape(bgpContent.sections.whatIsBGP.content)}</p></div> <div class="info-section"><h4>${$.escape(bgpContent.sections.asPath.title)}</h4> <p>${$.escape(bgpContent.sections.asPath.content)}</p> <ul><!--[-->`);

		const each_array_6 = $.ensure_array_like(bgpContent.sections.asPath.attributes);

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let attr = each_array_6[$$index_6];

			$$renderer.push(`<li><strong>${$.escape(attr.name)}:</strong> ${$.escape(attr.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="info-section"><h4>${$.escape(bgpContent.sections.routeTypes.title)}</h4> <ul><!--[-->`);

		const each_array_7 = $.ensure_array_like(bgpContent.sections.routeTypes.types);

		for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
			let type = each_array_7[$$index_7];

			$$renderer.push(`<li><strong>${$.escape(type.type)}:</strong> ${$.escape(type.description)} <small>(${$.escape(type.indicator)})</small></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="info-section"><h4>${$.escape(bgpContent.sections.dataSource.title)}</h4> <p>${$.escape(bgpContent.sections.dataSource.content)}</p></div></div> <div class="quick-tips svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Quick Tips</h4> <ul class="svelte-1gwrbdt"><!--[-->`);

		const each_array_8 = $.ensure_array_like(bgpContent.quickTips);

		for (let idx = 0, $$length = each_array_8.length; idx < $$length; idx++) {
			let tip = each_array_8[idx];

			$$renderer.push(`<li class="svelte-1gwrbdt">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div>`);
	});
}