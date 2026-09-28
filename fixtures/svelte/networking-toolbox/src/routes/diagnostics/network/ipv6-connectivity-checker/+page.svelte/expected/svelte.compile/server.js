import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { ipv6ConnectivityContent as content } from '$lib/content/ipv6-connectivity';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;

		async function testConnectivity() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/ipv6-connectivity', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || 'Test failed');
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		async function copyResults() {
			if (!results) return;

			let text = `IPv6 Connectivity Test\nGenerated at: ${results.timestamp}\n\n`;

			text += `IPv4: ${results.ipv4.success ? 'Connected' : 'Not Available'}\n`;

			if (results.ipv4.success) {
				text += `  IP: ${results.ipv4.ip}\n`;
				text += `  Latency: ${results.ipv4.latency}ms\n`;
			}

			text += `\nIPv6: ${results.ipv6.success ? 'Connected' : 'Not Available'}\n`;

			if (results.ipv6.success) {
				text += `  IP: ${results.ipv6.ip}\n`;
				text += `  Latency: ${results.ipv6.latency}ms\n`;
			}

			text += `\nDual-Stack: ${results.dualStack ? 'Yes' : 'No'}\n`;

			if (results.preferredProtocol) {
				text += `Preferred Protocol: ${results.preferredProtocol}\n`;
			}

			await navigator.clipboard.writeText(text);
			copiedState = true;
			setTimeout(() => copiedState = false, 1500);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(content.title)}</h1> <p>${$.escape(content.description)}</p></header> <div class="card input-card"><div class="card-header"><h3>Connectivity Test</h3></div> <div class="card-content svelte-xcuhlg"><div class="lookup-form"><button class="lookup-btn"${$.attr('disabled', loading, true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Testing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'network', size: 'sm' });
			$$renderer.push(`<!----> Test IPv6 Connectivity`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content svelte-xcuhlg"><div class="error-message svelte-xcuhlg">`);
			Icon($$renderer, { name: 'alert-circle', size: 'md' });
			$$renderer.push(`<!----> <span>${$.escape(error)}</span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>Connectivity Results</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(copiedState ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content svelte-xcuhlg"><div class="status-overview"><div${$.attr_class(`status-item ${results.dualStack ? 'success' : 'warning'}`)}>`);

			Icon($$renderer, {
				name: results.dualStack ? 'check-circle' : 'alert-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <div><h4>${$.escape(results.dualStack ? 'Dual-Stack Available' : 'Single Protocol Only')}</h4> <p>${$.escape(results.dualStack
				? 'Both IPv4 and IPv6 connectivity are available'
				: results.ipv4.success
					? 'Only IPv4 connectivity is available'
					: results.ipv6.success
						? 'Only IPv6 connectivity is available'
						: 'No connectivity detected')}</p></div></div></div> <div class="results-grid"><div class="result-card svelte-xcuhlg"><h4>`);

			Icon($$renderer, { name: 'network', size: 'sm' });
			$$renderer.push(`<!----> IPv4 Connectivity</h4> <div${$.attr_class(`connectivity-status ${results.ipv4.success ? 'success' : 'error'}`, 'svelte-xcuhlg')}>`);

			Icon($$renderer, {
				name: results.ipv4.success ? 'check-circle' : 'x-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <span>${$.escape(results.ipv4.success ? 'Connected' : 'Not Available')}</span></div> `);

			if (results.ipv4.success) {
				$$renderer.push(`<!--[0--><div class="info-list svelte-xcuhlg"><div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'globe', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">IP Address</span> <span class="info-value svelte-xcuhlg">${$.escape(results.ipv4.ip)}</span></div></div> <div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'clock', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Latency</span> <span class="info-value svelte-xcuhlg">${$.escape(results.ipv4.latency)}ms</span></div></div></div>`);
			} else if (results.ipv4.error && results.ipv4.error !== 'fetch failed') {
				$$renderer.push(`<!--[1--><div class="error-text svelte-xcuhlg">${$.escape(results.ipv4.error)}</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-text svelte-xcuhlg">No IPv4 connectivity available</div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="result-card svelte-xcuhlg"><h4>`);
			Icon($$renderer, { name: 'network', size: 'sm' });
			$$renderer.push(`<!----> IPv6 Connectivity</h4> <div${$.attr_class(`connectivity-status ${results.ipv6.success ? 'success' : 'error'}`, 'svelte-xcuhlg')}>`);

			Icon($$renderer, {
				name: results.ipv6.success ? 'check-circle' : 'x-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <span>${$.escape(results.ipv6.success ? 'Connected' : 'Not Available')}</span></div> `);

			if (results.ipv6.success) {
				$$renderer.push(`<!--[0--><div class="info-list svelte-xcuhlg"><div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'globe', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">IP Address</span> <span class="info-value svelte-xcuhlg">${$.escape(results.ipv6.ip)}</span></div></div> <div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'clock', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Latency</span> <span class="info-value svelte-xcuhlg">${$.escape(results.ipv6.latency)}ms</span></div></div></div>`);
			} else if (results.ipv6.error && results.ipv6.error !== 'fetch failed') {
				$$renderer.push(`<!--[1--><div class="error-text svelte-xcuhlg">${$.escape(results.ipv6.error)}</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-text svelte-xcuhlg">No IPv6 connectivity available</div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (results.dualStack) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-xcuhlg"><h4>`);
				Icon($$renderer, { name: 'info', size: 'sm' });
				$$renderer.push(`<!----> Connection Summary</h4> <div class="info-list svelte-xcuhlg"><div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Dual-Stack</span> <span class="info-value success svelte-xcuhlg">Enabled</span></div></div> `);

				if (results.preferredProtocol) {
					$$renderer.push(`<!--[0--><div class="info-item svelte-xcuhlg">`);
					Icon($$renderer, { name: 'zap', size: 'sm' });
					$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Preferred Protocol</span> <span class="info-value preferred svelte-xcuhlg">${$.escape(results.preferredProtocol)}</span></div></div> <div class="info-note svelte-xcuhlg">`);
					Icon($$renderer, { name: 'info', size: 'xs' });
					$$renderer.push(`<!----> Based on latency comparison</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="info-item svelte-xcuhlg">`);
				Icon($$renderer, { name: 'clock', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Tested At</span> <span class="info-value svelte-xcuhlg">${$.escape(new Date(results.timestamp).toLocaleString())}</span></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About IPv6 Connectivity</h3></div> <div class="card-content svelte-xcuhlg"><section><h4>${$.escape(content.sections.whatIsIPv6.title)}</h4> <p>${$.escape(content.sections.whatIsIPv6.content)}</p></section> <hr/> <section><h4>${$.escape(content.sections.dualStack.title)}</h4> <p>${$.escape(content.sections.dualStack.content)}</p> <ul class="svelte-xcuhlg"><!--[-->`);

		const each_array = $.ensure_array_like(content.sections.dualStack.benefits);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { benefit, description } = each_array[$$index];

			$$renderer.push(`<li><strong>${$.escape(benefit)}:</strong> ${$.escape(description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></section> <hr/> <section><h4>${$.escape(content.sections.ipv6Advantages.title)}</h4> <ul class="svelte-xcuhlg"><!--[-->`);

		const each_array_1 = $.ensure_array_like(content.sections.ipv6Advantages.advantages);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { advantage, description } = each_array_1[$$index_1];

			$$renderer.push(`<li><strong>${$.escape(advantage)}:</strong> ${$.escape(description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></section> <hr/> <section><h4>Quick Tips</h4> <ul class="svelte-xcuhlg"><!--[-->`);

		const each_array_2 = $.ensure_array_like(content.quickTips);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let tip = each_array_2[$$index_2];

			$$renderer.push(`<li>${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></section></div></div></div>`);
	});
}