import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { calculateReverseZones } from '$lib/utils/reverse-dns.js';
import { useClipboard } from '$lib/composables';

export default function ReverseZonesCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let cidrInput = '192.168.1.0/24';
		let results = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

		const examples = [
			{
				label: 'IPv4 /24 Network',
				cidr: '192.168.1.0/24',
				description: 'Single /24 zone delegation'
			},

			{
				label: 'IPv4 /16 Network',
				cidr: '10.0.0.0/16',
				description: '/16 network with multiple /24 zones'
			},

			{
				label: 'IPv4 /20 Block',
				cidr: '172.16.32.0/20',
				description: '16 /24 zones needed'
			},

			{
				label: 'IPv4 /28 Subnet',
				cidr: '192.168.1.16/28',
				description: 'Small subnet within /24 zone'
			},

			{
				label: 'IPv6 /64 Network',
				cidr: '2001:db8:1000::/64',
				description: 'IPv6 nibble boundary delegation'
			},

			{
				label: 'IPv6 /48 Prefix',
				cidr: '2001:db8::/48',
				description: 'IPv6 /48 delegation zone'
			}
		];

		function loadExample(example) {
			cidrInput = example.cidr;
			selectedExample = example.label;
			_userModified = false;
			calculateZones();
		}

		function calculateZones() {
			if (!cidrInput.trim()) {
				results = null;

				return;
			}

			try {
				const trimmed = cidrInput.trim();
				const zones = calculateReverseZones(trimmed);

				if (zones.length === 0) {
					throw new Error('No reverse zones could be calculated for this CIDR');
				}

				// Analyze the results
				const ipv4Zones = zones.filter((z) => z.type === 'IPv4').length;

				const ipv6Zones = zones.filter((z) => z.type === 'IPv6').length;
				let delegationType = '';

				if (ipv4Zones > 0) {
					if (ipv4Zones === 1) {
						delegationType = zones[0].delegation.includes('/24') ? '/24 network' : `Custom (${zones[0].delegation})`;
					} else {
						delegationType = `Multiple zones (${ipv4Zones} x /24)`;
					}
				} else if (ipv6Zones > 0) {
					const nibbleDepth = zones[0].nibbleDepth || 0;

					delegationType = `IPv6 nibble boundary (${nibbleDepth} nibbles)`;
				}

				results = {
					success: true,
					zones,
					analysis: {
						totalZones: zones.length,
						ipv4Zones,
						ipv6Zones,
						delegationType
					}
				};
			} catch(error) {
				results = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					zones: [],
					analysis: {
						totalZones: 0,
						ipv4Zones: 0,
						ipv6Zones: 0,
						delegationType: ''
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			calculateZones();
		}

		function generateBindConfig(zones) {
			return zones.map((zone) => `zone "${zone.zone}" {
    type master;
    file "/etc/bind/zones/${zone.zone}";
};`).join('\n\n');
		}

		function generateDelegationCommands(zones) {
			return zones.map((zone) => {
				const _zoneFile = zone.zone.replace(/\./g, '_');

				return `# Create zone file for ${zone.zone}
touch /etc/bind/zones/${zone.zone}
chown bind:bind /etc/bind/zones/${zone.zone}
chmod 644 /etc/bind/zones/${zone.zone}`;
			}).join('\n\n');
		}

		// Calculate on component load
		calculateZones();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Reverse Zones Calculator</h1> <p>Calculate the minimal set of reverse DNS zones needed to delegate a CIDR block</p></header> <div class="card info-card svelte-14lwgkn"><div class="overview-content svelte-14lwgkn"><div class="overview-item svelte-14lwgkn">`);
		Icon($$renderer, { name: 'layers', size: 'sm' });

		$$renderer.push(`<!----> <div><strong class="svelte-14lwgkn">Zone Boundaries:</strong> IPv4 uses octet boundaries (/8, /16, /24) and IPv6 uses nibble boundaries (4-bit
          increments).</div></div> <div class="overview-item svelte-14lwgkn">`);

		Icon($$renderer, { name: 'share', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-14lwgkn">Delegation:</strong> DNS zones must be properly delegated by upstream providers at natural boundaries.</div></div> <div class="overview-item svelte-14lwgkn">`);
		Icon($$renderer, { name: 'calculator', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-14lwgkn">Optimization:</strong> Calculate the minimal number of zones needed to avoid unnecessary complexity.</div></div></div></div> <div class="card examples-card svelte-14lwgkn"><details class="examples-details svelte-14lwgkn"><summary class="examples-summary svelte-14lwgkn">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-14lwgkn">Quick Examples</h3></summary> <div class="examples-grid svelte-14lwgkn"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-14lwgkn')}><div class="example-header"><div class="example-label svelte-14lwgkn">${$.escape(example.label)}</div></div> <code class="example-input svelte-14lwgkn">${$.escape(example.cidr)}</code> <div class="example-description svelte-14lwgkn">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-14lwgkn"><div class="input-group svelte-14lwgkn"><label for="cidr-input" class="svelte-14lwgkn">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> CIDR Block</label> <input id="cidr-input" type="text"${$.attr('value', cidrInput)} placeholder="192.168.1.0/24 or 2001:db8::/64"${$.attr_class(`cidr-input ${results?.success === true ? 'valid' : results?.success === false ? 'invalid' : ''}`, 'svelte-14lwgkn')} spellcheck="false"/></div></div> `);

		if (results && cidrInput.trim()) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-14lwgkn">`);

			if (results.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-14lwgkn"><h3 class="svelte-14lwgkn">Reverse Zone Analysis</h3> <div class="summary-stats svelte-14lwgkn"><div class="stat-item svelte-14lwgkn"><span class="stat-value svelte-14lwgkn">${$.escape(results.analysis.totalZones)}</span> <span class="stat-label svelte-14lwgkn">Total Zones</span></div> <div class="stat-item svelte-14lwgkn"><span class="stat-value svelte-14lwgkn">${$.escape(results.analysis.delegationType)}</span> <span class="stat-label svelte-14lwgkn">Delegation Type</span></div></div></div> <div class="zones-section svelte-14lwgkn"><h4 class="svelte-14lwgkn">`);
				Icon($$renderer, { name: 'list', size: 'sm' });
				$$renderer.push(`<!----> Required Reverse Zones</h4> <div class="zones-grid svelte-14lwgkn"><!--[-->`);

				const each_array_1 = $.ensure_array_like(results.zones);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let zone = each_array_1[index];

					$$renderer.push(`<div class="zone-card svelte-14lwgkn"><div class="zone-header svelte-14lwgkn"><div class="zone-info svelte-14lwgkn"><h5 class="svelte-14lwgkn">${$.escape(zone.zone)}</h5> <div class="zone-meta svelte-14lwgkn"><span${$.attr_class(`zone-type ${$.stringify(zone.type.toLowerCase())}`, 'svelte-14lwgkn')}>${$.escape(zone.type)}</span> <span class="delegation-info svelte-14lwgkn">${$.escape(zone.delegation)}</span> `);

					if (zone.nibbleDepth) {
						$$renderer.push(`<!--[0--><span class="nibble-info svelte-14lwgkn">${$.escape(zone.nibbleDepth)} nibbles</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <button${$.attr_class(`copy-button ${clipboard.isCopied(`zone-${index}`) ? 'copied' : ''}`, 'svelte-14lwgkn')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`zone-${index}`) ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----></button></div> <div class="zone-description svelte-14lwgkn">`);

					if (zone.type === 'IPv4') {
						$$renderer.push('<!--[0-->');

						if (zone.delegation === '/24') {
							$$renderer.push(`<!--[0-->Standard /24 reverse zone for 256 addresses`);
						} else if (zone.delegation === '/16') {
							$$renderer.push(`<!--[1-->/16 reverse zone covering 65,536 addresses`);
						} else if (zone.delegation === '/8') {
							$$renderer.push(`<!--[2-->/8 reverse zone covering 16,777,216 addresses`);
						} else {
							$$renderer.push(`<!--[-1-->Custom IPv4 reverse zone for ${$.escape(zone.delegation)} prefix`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1-->IPv6 reverse zone using ${$.escape(zone.nibbleDepth)} nibble${$.escape(zone.nibbleDepth !== 1 ? 's' : '')}
                    (${$.escape(zone.delegation)} prefix)`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="config-section svelte-14lwgkn"><h4 class="svelte-14lwgkn">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> Configuration Examples</h4> <div class="config-examples svelte-14lwgkn"><div class="config-example svelte-14lwgkn"><div class="config-header svelte-14lwgkn"><h5 class="svelte-14lwgkn">BIND9 Configuration</h5> <button${$.attr_class(`copy-button ${clipboard.isCopied('bind-config') ? 'copied' : ''}`, 'svelte-14lwgkn')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('bind-config') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----> Copy Config</button></div> <pre class="config-content svelte-14lwgkn"><code class="svelte-14lwgkn">${$.escape(generateBindConfig(results.zones))}</code></pre></div> <div class="config-example svelte-14lwgkn"><div class="config-header svelte-14lwgkn"><h5 class="svelte-14lwgkn">Zone File Setup Commands</h5> <button${$.attr_class(`copy-button ${clipboard.isCopied('setup-commands') ? 'copied' : ''}`, 'svelte-14lwgkn')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('setup-commands') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----> Copy Commands</button></div> <pre class="config-content svelte-14lwgkn"><code class="svelte-14lwgkn">${$.escape(generateDelegationCommands(results.zones))}</code></pre></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-14lwgkn">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-14lwgkn">Calculation Error</h4> <p class="svelte-14lwgkn">${$.escape(results.error)}</p> <div class="error-help svelte-14lwgkn"><strong>Valid formats:</strong> <ul class="svelte-14lwgkn"><li class="svelte-14lwgkn">IPv4 CIDR: 192.168.1.0/24, 10.0.0.0/16, 172.16.0.0/20</li> <li class="svelte-14lwgkn">IPv6 CIDR: 2001:db8::/64, fe80::/10, ::1/128</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-14lwgkn"><div class="education-grid svelte-14lwgkn"><div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">Zone Delegation Basics</h4> <p class="svelte-14lwgkn">Reverse DNS zones must be delegated at natural boundaries. IPv4 uses octet boundaries (/8, /16, /24) while
          IPv6 uses nibble boundaries (every 4 bits). Delegation happens from your ISP or hosting provider.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">IPv4 Boundaries</h4> <p class="svelte-14lwgkn">IPv4 reverse zones align with classful network boundaries: /8 creates single zones like <code class="svelte-14lwgkn">10.in-addr.arpa</code>, /16 creates zones like <code class="svelte-14lwgkn">0.10.in-addr.arpa</code>, and /24 creates zones like <code class="svelte-14lwgkn">1.0.10.in-addr.arpa</code>.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">IPv6 Nibbles</h4> <p class="svelte-14lwgkn">IPv6 reverse zones use nibble boundaries (4-bit increments). Each hex digit becomes a separate label in the <code class="svelte-14lwgkn">ip6.arpa</code> domain. A /48 prefix typically requires 12 nibbles of delegation.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">Practical Considerations</h4> <p class="svelte-14lwgkn">Most organizations receive /24 (IPv4) or /48 to /64 (IPv6) delegations from their ISP. Smaller subnets like
          /28 still require the full /24 zone to be delegated to you for proper reverse DNS operation.</p></div></div></div></div>`);
	});
}