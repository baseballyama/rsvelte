import * as $ from 'svelte/internal/server';
import SupernetCalculator from '$lib/components/tools/SupernetCalculator.svelte';
import '$lib/../styles/pages.scss';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="page-container">`);
	SupernetCalculator($$renderer, {});

	$$renderer.push(`<!----> <section class="explainer-section svelte-1g95cn8"><h3 class="svelte-1g95cn8">About Supernetting</h3> <p><strong>Supernetting</strong> (also called route aggregation or CIDR block aggregation) is the process of combining
      multiple smaller networks into a single larger network. This technique is essential for:</p> <div class="benefits-grid svelte-1g95cn8"><div class="benefit-item svelte-1g95cn8"><h4 class="svelte-1g95cn8">Reduced Routing Tables</h4> <p class="svelte-1g95cn8">Fewer routes mean faster lookups and reduced memory usage in routers</p></div> <div class="benefit-item svelte-1g95cn8"><h4 class="svelte-1g95cn8">Improved Scalability</h4> <p class="svelte-1g95cn8">Internet routing scales better with aggregated routes instead of individual subnets</p></div> <div class="benefit-item svelte-1g95cn8"><h4 class="svelte-1g95cn8">Better Performance</h4> <p class="svelte-1g95cn8">Reduced route advertisements and faster convergence in routing protocols</p></div> <div class="benefit-item svelte-1g95cn8"><h4 class="svelte-1g95cn8">Easier Management</h4> <p class="svelte-1g95cn8">Simplified network policies and access control lists</p></div></div> <div class="use-cases-section svelte-1g95cn8"><h4 class="svelte-1g95cn8">When to Use Supernetting</h4> <div class="use-cases-grid svelte-1g95cn8"><div class="use-case-item svelte-1g95cn8"><h5 class="svelte-1g95cn8">ISP Route Aggregation</h5> <p class="svelte-1g95cn8">Combining customer routes for BGP advertisements</p></div> <div class="use-case-item svelte-1g95cn8"><h5 class="svelte-1g95cn8">Enterprise Networks</h5> <p class="svelte-1g95cn8">Summarizing branch office networks at headquarters</p></div> <div class="use-case-item svelte-1g95cn8"><h5 class="svelte-1g95cn8">Data Centers</h5> <p class="svelte-1g95cn8">Aggregating server farm subnets for external advertisement</p></div> <div class="use-case-item svelte-1g95cn8"><h5 class="svelte-1g95cn8">Network Redesign</h5> <p class="svelte-1g95cn8">Optimizing existing IP allocations for better summarization</p></div></div></div> <div class="info-box svelte-1g95cn8"><h4 class="svelte-1g95cn8">`);

	Icon($$renderer, { name: 'lightbulb', size: 'sm' });

	$$renderer.push(`<!----> Pro Tip</h4> <p class="svelte-1g95cn8">For optimal supernetting, design your IP allocation strategy from the beginning. Contiguous, power-of-2 sized
        networks aggregate much more efficiently than scattered allocations.</p></div></section></div>`);
}