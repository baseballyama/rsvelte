import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRSplitter from '$lib/components/tools/CIDRSplitter.svelte';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="page-container"><!> <section class="explainer-section svelte-n7jada"><h3 class="svelte-n7jada">About CIDR Subnet Splitting</h3> <p>CIDR subnet splitting divides a larger network (parent) into smaller networks (children) of equal size. This is
      essential for efficient IP address allocation and network design.</p> <div class="split-modes svelte-n7jada"><div class="mode-item svelte-n7jada"><h4 class="svelte-n7jada"><!> Split by Count</h4> <p>Specify how many equal subnets you need. The tool calculates the required prefix length and creates exactly
          that many subnets (rounded up to the nearest power of 2).</p> <div class="mode-example svelte-n7jada"><div class="example-input"><code class="svelte-n7jada">192.168.1.0/24</code> → <strong>4 subnets</strong></div> <div class="arrow svelte-n7jada">→</div> <div class="example-output"><code class="svelte-n7jada">192.168.1.0/26</code><br/> <code class="svelte-n7jada">192.168.1.64/26</code><br/> <code class="svelte-n7jada">192.168.1.128/26</code><br/> <code class="svelte-n7jada">192.168.1.192/26</code></div></div></div> <div class="mode-item svelte-n7jada"><h4 class="svelte-n7jada"><!> Split by Prefix</h4> <p>Specify the target prefix length for child subnets. The tool creates all possible subnets at that prefix
          length within the parent network.</p> <div class="mode-example svelte-n7jada"><div class="example-input"><code class="svelte-n7jada">10.0.0.0/16</code> → <strong>/20 subnets</strong></div> <div class="arrow svelte-n7jada">→</div> <div class="example-output"><code class="svelte-n7jada">10.0.0.0/20</code> (16 subnets)<br/> <code class="svelte-n7jada">10.0.16.0/20</code><br/> <code class="svelte-n7jada">10.0.32.0/20</code><br/> <span class="more svelte-n7jada">... and 13 more</span></div></div></div></div> <div class="key-concepts svelte-n7jada"><h4 class="svelte-n7jada">Key Concepts</h4> <div class="concepts-grid svelte-n7jada"><div class="concept svelte-n7jada"><h5 class="svelte-n7jada">Power of 2 Rule</h5> <p class="svelte-n7jada">Network splitting always results in a power-of-2 number of subnets due to binary addressing.</p></div> <div class="concept svelte-n7jada"><h5 class="svelte-n7jada">Prefix Length</h5> <p class="svelte-n7jada">Child subnets always have a longer prefix (smaller network) than the parent.</p></div> <div class="concept svelte-n7jada"><h5 class="svelte-n7jada">Address Space</h5> <p class="svelte-n7jada">All child subnets combined exactly equal the parent's address space.</p></div> <div class="concept svelte-n7jada"><h5 class="svelte-n7jada">Binary Boundaries</h5> <p class="svelte-n7jada">Subnet boundaries align with binary bit boundaries for efficient routing.</p></div></div></div> <div class="use-cases-box svelte-n7jada"><h4 class="svelte-n7jada">Common Use Cases</h4> <ul class="svelte-n7jada"><li class="svelte-n7jada"><strong class="svelte-n7jada">Office Networks:</strong> Split a /24 into department subnets</li> <li class="svelte-n7jada"><strong class="svelte-n7jada">Cloud VPCs:</strong> Create isolated subnets for different tiers</li> <li class="svelte-n7jada"><strong class="svelte-n7jada">VLSM Design:</strong> Plan hierarchical network addressing</li> <li class="svelte-n7jada"><strong class="svelte-n7jada">Data Centers:</strong> Segment networks for different services</li></ul></div> <div class="technical-notes svelte-n7jada"><h4 class="svelte-n7jada">Technical Notes</h4> <div class="notes-grid svelte-n7jada"><div class="note svelte-n7jada"><h5 class="svelte-n7jada">IPv4 vs IPv6</h5> <p class="svelte-n7jada">IPv4 uses 32-bit addresses with /0-/32 prefixes. IPv6 uses 128-bit addresses with /0-/128 prefixes. The
            splitting logic is identical for both.</p></div> <div class="note svelte-n7jada"><h5 class="svelte-n7jada">Network vs Host Addresses</h5> <p class="svelte-n7jada">In IPv4, the first address is the network address and the last is the broadcast address. IPv6 doesn't have
            broadcast, so the first and last addresses are both usable.</p></div></div></div></section></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	CIDRSplitter(node, {});

	var section = $.sibling(node, 2);
	var div_1 = $.sibling($.child(section), 4);
	var div_2 = $.child(div_1);
	var h4 = $.child(div_2);
	var node_1 = $.child(h4);

	Icon(node_1, { name: 'hash', size: 'sm' });
	$.next();
	$.reset(h4);
	$.next(4);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h4_1 = $.child(div_3);
	var node_2 = $.child(h4_1);

	Icon(node_2, { name: 'target', size: 'sm' });
	$.next();
	$.reset(h4_1);
	$.next(4);
	$.reset(div_3);
	$.reset(div_1);
	$.next(6);
	$.reset(section);
	$.reset(div);
	$.append($$anchor, div);
}