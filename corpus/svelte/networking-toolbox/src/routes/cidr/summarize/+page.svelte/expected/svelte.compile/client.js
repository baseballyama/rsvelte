import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRSummarizer from '$lib/components/tools/CIDRSummarizer.svelte';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="page-container"><!> <section class="explainer-section svelte-cp3zw1"><h3 class="svelte-cp3zw1">About CIDR Summarization</h3> <p><strong>CIDR Summarization</strong> optimizes network routing by combining multiple IP addresses, ranges, and CIDR
      blocks into the minimal set of CIDR prefixes that covers the same address space.</p> <div class="benefits-grid svelte-cp3zw1"><div class="benefit-item svelte-cp3zw1"><h4 class="svelte-cp3zw1">Route Table Optimization</h4> <p class="svelte-cp3zw1">Reduce routing table size by aggregating multiple routes into fewer, larger prefixes</p></div> <div class="benefit-item svelte-cp3zw1"><h4 class="svelte-cp3zw1">Network Efficiency</h4> <p class="svelte-cp3zw1">Minimize routing protocol overhead and improve convergence times</p></div> <div class="benefit-item svelte-cp3zw1"><h4 class="svelte-cp3zw1">Dual Protocol Support</h4> <p class="svelte-cp3zw1">Handle mixed IPv4 and IPv6 inputs with separate optimized outputs</p></div> <div class="benefit-item svelte-cp3zw1"><h4 class="svelte-cp3zw1">Flexible Input Formats</h4> <p class="svelte-cp3zw1">Process single IPs, CIDR blocks, and explicit ranges in any combination</p></div></div> <div class="modes-section svelte-cp3zw1"><h4 class="svelte-cp3zw1">Summarization Modes</h4> <div class="modes-grid svelte-cp3zw1"><div class="mode-item svelte-cp3zw1"><h5>Exact Merge</h5> <p><strong>Conservative approach:</strong> Merges overlapping ranges exactly without additional aggregation</p> <div class="mode-example svelte-cp3zw1"><span class="example-label svelte-cp3zw1">Example:</span> <code class="example-input svelte-cp3zw1">192.168.1.0/24 + 192.168.2.0/24</code> <span class="arrow svelte-cp3zw1">→</span> <code class="example-output svelte-cp3zw1">192.168.1.0/24, 192.168.2.0/24</code></div></div> <div class="mode-item svelte-cp3zw1"><h5>Minimal Cover</h5> <p><strong>Aggressive optimization:</strong> Finds the smallest set of CIDR blocks that covers all inputs</p> <div class="mode-example svelte-cp3zw1"><span class="example-label svelte-cp3zw1">Example:</span> <code class="example-input svelte-cp3zw1">192.168.1.0/24 + 192.168.2.0/24</code> <span class="arrow svelte-cp3zw1">→</span> <code class="example-output svelte-cp3zw1">192.168.0.0/23</code></div></div></div></div> <div class="use-cases-section svelte-cp3zw1"><h4 class="svelte-cp3zw1">Common Use Cases</h4> <div class="use-cases-grid svelte-cp3zw1"><div class="use-case-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">BGP Route Aggregation</h5> <p class="svelte-cp3zw1">Optimize BGP advertisements by summarizing customer routes into provider prefixes</p></div> <div class="use-case-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">Firewall Rule Optimization</h5> <p class="svelte-cp3zw1">Reduce ACL complexity by consolidating IP ranges into fewer CIDR rules</p></div> <div class="use-case-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">Network Planning</h5> <p class="svelte-cp3zw1">Analyze address space utilization and optimize subnet allocations</p></div> <div class="use-case-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">Migration Planning</h5> <p class="svelte-cp3zw1">Consolidate legacy network ranges during infrastructure modernization</p></div></div></div> <div class="input-formats-section svelte-cp3zw1"><h4 class="svelte-cp3zw1">Supported Input Formats</h4> <div class="formats-grid svelte-cp3zw1"><div class="format-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">Single IP Addresses</h5> <div class="format-examples svelte-cp3zw1"><code class="svelte-cp3zw1">192.168.1.100</code> <code class="svelte-cp3zw1">2001:db8::1</code></div></div> <div class="format-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">CIDR Blocks</h5> <div class="format-examples svelte-cp3zw1"><code class="svelte-cp3zw1">10.0.0.0/8</code> <code class="svelte-cp3zw1">2001:db8::/32</code></div></div> <div class="format-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">IP Ranges</h5> <div class="format-examples svelte-cp3zw1"><code class="svelte-cp3zw1">172.16.1.1-172.16.1.100</code> <code class="svelte-cp3zw1">2001:db8::1-2001:db8::ffff</code></div></div> <div class="format-item svelte-cp3zw1"><h5 class="svelte-cp3zw1">Mixed Lists</h5> <div class="format-examples svelte-cp3zw1"><code class="svelte-cp3zw1">One item per line</code> <code class="svelte-cp3zw1">IPv4 and IPv6 together</code></div></div></div></div> <div class="info-box svelte-cp3zw1"><h4 class="svelte-cp3zw1"><!> Optimization Tips</h4> <p class="svelte-cp3zw1">For maximum efficiency, align your network allocations to power-of-2 boundaries. Contiguous address blocks
        summarize much more effectively than scattered allocations. Use the exact merge mode for conservative
        summarization or minimal cover for aggressive optimization.</p></div></section></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	CIDRSummarizer(node, {});

	var section = $.sibling(node, 2);
	var div_1 = $.sibling($.child(section), 12);
	var h4 = $.child(div_1);
	var node_1 = $.child(h4);

	Icon(node_1, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(h4);
	$.next(2);
	$.reset(div_1);
	$.reset(section);
	$.reset(div);
	$.append($$anchor, div);
}