import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { asnGeoContent } from '$lib/content/asn-geo';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ip = '8.8.8.8';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{ ip: '8.8.8.8', description: 'Google Public DNS' },
			{ ip: '2.58.47.0', description: 'M247 Proton' },
			{ ip: '1.1.1.1', description: 'Cloudflare DNS' },
			{ ip: '140.82.121.4', description: 'GitHub' },
			{ ip: '151.101.1.140', description: 'Fastly CDN' },
			{ ip: '2606:4700:4700::1111', description: 'Cloudflare IPv6' }
		];

		async function lookupIP() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/asn-geo', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ip: ip.trim() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `Lookup failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			ip = example.ip;
			selectedExampleIndex = index;
			lookupIP();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		async function copyResults() {
			if (!results) return;

			let text = `ASN & Geolocation Lookup for ${results.ip}\n`;

			text += `Generated at: ${results.timestamp}\n\n`;

			if (results.asn) {
				text += `ASN: AS${results.asn}\n`;

				if (results.asnOrg) text += `AS Organization: ${results.asnOrg}\n`;
			}

			if (results.isp) text += `ISP: ${results.isp}\n`;
			if (results.organization) text += `Organization: ${results.organization}\n`;

			text += `\nLocation:\n`;

			if (results.city) text += `City: ${results.city}\n`;
			if (results.regionName) text += `Region: ${results.regionName}\n`;
			if (results.country) text += `Country: ${results.country} (${results.countryCode})\n`;
			if (results.zip) text += `ZIP: ${results.zip}\n`;
			if (results.timezone) text += `Timezone: ${results.timezone}\n`;

			if (results.latitude !== undefined && results.longitude !== undefined) {
				text += `\nCoordinates: ${results.latitude}, ${results.longitude}\n`;
			}

			text += `\nConnection Type:\n`;
			text += `Mobile: ${results.mobile ? 'Yes' : 'No'}\n`;
			text += `Proxy/VPN: ${results.proxy ? 'Yes' : 'No'}\n`;
			text += `Hosting/Datacenter: ${results.hosting ? 'Yes' : 'No'}\n`;
			await navigator.clipboard.writeText(text);
			copiedState = true;
			setTimeout(() => copiedState = false, 1500);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(asnGeoContent.title)}</h1> <p>${$.escape(asnGeoContent.description)}</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Example Lookups</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.ip)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>IP Lookup</h3></div> <div class="card-content"><div class="lookup-form svelte-2zofru"><div class="input-row svelte-2zofru"><label for="ip" class="svelte-2zofru">IP Address</label> <input id="ip" type="text"${$.attr('value', ip)} placeholder="8.8.8.8 or 2001:4860:4860::8888" class="svelte-2zofru"/></div> <button class="lookup-btn svelte-2zofru"${$.attr('disabled', loading || !ip.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Looking up...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Lookup`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>Results for ${$.escape(results.ip)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(copiedState ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="results-grid svelte-2zofru"><div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Network Information</h4> <div class="info-list svelte-2zofru">`);

			if (results.asn) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'hash', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">ASN</span> <span class="info-value asn-badge svelte-2zofru">AS${$.escape(results.asn)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.asnOrg) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'building', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Organization</span> <span class="info-value svelte-2zofru">${$.escape(results.asnOrg)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.isp) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'wifi', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">ISP</span> <span class="info-value svelte-2zofru">${$.escape(results.isp)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Geographic Location</h4> <div class="info-list svelte-2zofru">`);

			if (results.country) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'flag', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Country</span> <span class="info-value svelte-2zofru">${$.escape(results.country)} (${$.escape(results.countryCode)})</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.regionName) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'map-pin', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Region</span> <span class="info-value svelte-2zofru">${$.escape(results.regionName)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.city) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'building', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">City</span> <span class="info-value svelte-2zofru">${$.escape(results.city)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.timezone) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-2zofru">`);
				Icon($$renderer, { name: 'clock', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Timezone</span> <span class="info-value svelte-2zofru">${$.escape(results.timezone)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (results.latitude !== undefined && results.longitude !== undefined) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Coordinates</h4> <div class="coordinates-display svelte-2zofru"><div class="coordinate-info svelte-2zofru"><div class="coordinate-item svelte-2zofru">`);
				Icon($$renderer, { name: 'navigation', size: 'md' });
				$$renderer.push(`<!----> <div class="coordinate-values svelte-2zofru"><div class="coordinate-row svelte-2zofru"><span class="coordinate-label svelte-2zofru">Latitude:</span> <span class="coordinate-value svelte-2zofru">${$.escape(results.latitude.toFixed(4))}°</span></div> <div class="coordinate-row svelte-2zofru"><span class="coordinate-label svelte-2zofru">Longitude:</span> <span class="coordinate-value svelte-2zofru">${$.escape(results.longitude.toFixed(4))}°</span></div></div></div> <a${$.attr('href', `https://www.openstreetmap.org/?mlat=${results.latitude}&mlon=${results.longitude}&zoom=12`)} target="_blank" rel="noopener noreferrer" class="map-link svelte-2zofru">`);
				Icon($$renderer, { name: 'external-link', size: 'xs' });
				$$renderer.push(`<!----> View full map</a></div> <div class="map-container svelte-2zofru"><iframe title="Location map"${$.attr('src', `https://www.openstreetmap.org/export/embed.html?bbox=${results.longitude - 0.1},${results.latitude - 0.1},${results.longitude + 0.1},${results.latitude + 0.1}&layer=mapnik&marker=${results.latitude},${results.longitude}`)} style="border: 0" class="svelte-2zofru"></iframe></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Connection Type</h4> <div class="connection-flags svelte-2zofru"><div${$.attr_class('flag-item svelte-2zofru', void 0, { 'active': results.mobile })}>`);
			Icon($$renderer, { name: results.mobile ? 'check-circle' : 'circle', size: 'sm' });
			$$renderer.push(`<!----> <span>Mobile Network</span></div> <div${$.attr_class('flag-item svelte-2zofru', void 0, { 'active': results.proxy })}>`);
			Icon($$renderer, { name: results.proxy ? 'check-circle' : 'circle', size: 'sm' });
			$$renderer.push(`<!----> <span>Proxy/VPN</span></div> <div${$.attr_class('flag-item svelte-2zofru', void 0, { 'active': results.hosting })}>`);

			Icon($$renderer, {
				name: results.hosting ? 'check-circle' : 'circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>Hosting/Datacenter</span></div></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>Lookup Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card svelte-2zofru"><div class="card-header"><h3>About ASN &amp; Geolocation</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>${$.escape(asnGeoContent.sections.whatIsGeoIP.title)}</h4> <p>${$.escape(asnGeoContent.sections.whatIsGeoIP.content)}</p></div> <div class="info-section"><h4>${$.escape(asnGeoContent.sections.accuracy.title)}</h4> <ul><!--[-->`);

		const each_array_1 = $.ensure_array_like(asnGeoContent.sections.accuracy.levels);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let level = each_array_1[$$index_1];

			$$renderer.push(`<li><strong>${$.escape(level.level)} (${$.escape(level.accuracy)}):</strong> ${$.escape(level.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="info-section"><h4>${$.escape(asnGeoContent.sections.asnExplained.title)}</h4> <p>${$.escape(asnGeoContent.sections.asnExplained.content)}</p></div> <div class="info-section"><h4>${$.escape(asnGeoContent.sections.dataSource.title)}</h4> <p>${$.escape(asnGeoContent.sections.dataSource.content)}</p></div></div> <div class="quick-tips svelte-2zofru"><h4 class="svelte-2zofru">Quick Tips</h4> <ul class="svelte-2zofru"><!--[-->`);

		const each_array_2 = $.ensure_array_like(asnGeoContent.quickTips);

		for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
			let tip = each_array_2[idx];

			$$renderer.push(`<li class="svelte-2zofru">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div>`);
	});
}