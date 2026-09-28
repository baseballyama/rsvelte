import * as $ from 'svelte/internal/server';
import { commonPortsContent } from '$lib/content/common-ports.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1>${$.escape(commonPortsContent.title)}</h1> <p class="subtitle">${$.escape(commonPortsContent.description)}</p></div> <div class="ref-section"><h2>Port Ranges</h2> <table class="ref-table"><thead><tr><th>Range</th><th>Name</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(commonPortsContent.ranges);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let range = each_array[index];

			$$renderer.push(`<tr><td><code>${$.escape(range.range)}</code></td><td>${$.escape(range.name)}</td><td>${$.escape(range.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Well-Known Ports (0-1023)</h2> <table class="ref-table"><thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array_1 = $.ensure_array_like(commonPortsContent.wellKnown);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let port = each_array_1[$$index_1];

			$$renderer.push(`<tr><td><code>${$.escape(port.port)}</code></td><td>${$.escape(port.protocol)}</td><td><strong>${$.escape(port.service)}</strong></td><td>${$.escape(port.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Registered Ports (1024-49151)</h2> <table class="ref-table"><thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Description</th></tr></thead><tbody><!--[-->`);

		const each_array_2 = $.ensure_array_like(commonPortsContent.registered);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let port = each_array_2[$$index_2];

			$$renderer.push(`<tr><td><code>${$.escape(port.port)}</code></td><td>${$.escape(port.protocol)}</td><td><strong>${$.escape(port.service)}</strong></td><td>${$.escape(port.description)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div> <div class="ref-section"><h2>Common Service Categories</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Web Services</div> <!--[-->`);

		const each_array_3 = $.ensure_array_like(commonPortsContent.categories.web);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let service = each_array_3[index];

			$$renderer.push(`<div class="item-code">${$.escape(service.ports)} - ${$.escape(service.service)}</div> <div class="item-description"${$.attr_style(`color: ${service.secure ? 'var(--color-success)' : 'var(--color-error)'}`)}>${$.escape(service.secure ? 'Secure' : 'Not secure')}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Email Services</div> <!--[-->`);

		const each_array_4 = $.ensure_array_like(commonPortsContent.categories.email);

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let service = each_array_4[index];

			$$renderer.push(`<div class="item-code">${$.escape(service.ports)} - ${$.escape(service.service)}</div> <div class="item-description"${$.attr_style(`color: ${service.secure ? 'var(--color-success)' : 'var(--color-error)'}`)}>${$.escape(service.secure ? 'Secure' : 'Not secure')}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Remote Access</div> <!--[-->`);

		const each_array_5 = $.ensure_array_like(commonPortsContent.categories.remote);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let service = each_array_5[index];

			$$renderer.push(`<div class="item-code">${$.escape(service.ports)} - ${$.escape(service.service)}</div> <div class="item-description"${$.attr_style(`color: ${service.secure ? 'var(--color-success)' : 'var(--color-error)'}`)}>${$.escape(service.secure ? 'Secure' : 'Not secure')}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-item"><div class="item-title">Database Services</div> <!--[-->`);

		const each_array_6 = $.ensure_array_like(commonPortsContent.categories.database);

		for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
			let service = each_array_6[index];

			$$renderer.push(`<div class="item-code">${$.escape(service.ports)} - ${$.escape(service.service)}</div> <div class="item-description"${$.attr_style(`color: ${service.secure ? 'var(--color-success)' : 'var(--color-error)'}`)}>${$.escape(service.secure ? 'Secure' : 'Not secure')}</div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="ref-section"><h2>Important Security Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!--[-->`);

		const each_array_7 = $.ensure_array_like(commonPortsContent.tips);

		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let tip = each_array_7[index];

			$$renderer.push(`<div class="example-item"><div class="example-description">${$.escape(tip)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="ref-warning"><div class="warning-title">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });

		$$renderer.push(`<!----> Security Note</div> <div class="warning-content">Many services have both secure and insecure versions. Always use the secure versions (HTTPS, SSH, FTPS, etc.)
          when possible, especially over untrusted networks.</div></div></div></div></div>`);
	});
}