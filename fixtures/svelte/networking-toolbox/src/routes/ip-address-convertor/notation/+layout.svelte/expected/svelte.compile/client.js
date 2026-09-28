import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../../../styles/pages.scss';
import '../../../styles/converters.scss';
import '../../../styles/components.scss';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="container"><!> <div class="info-cards-section svelte-1sg0v44"><div class="explainer-card no-hover svelte-1sg0v44"><h3 class="svelte-1sg0v44"><!> Understanding IPv6 Address Notation</h3> <div class="explainer-content"><div class="format-explanations svelte-1sg0v44"><div class="format-explanation svelte-1sg0v44"><h4 class="svelte-1sg0v44"><span class="format-badge expanded svelte-1sg0v44">Expanded (Full) Format</span></h4> <p><strong>Structure:</strong> All 32 hexadecimal characters with colons every 4 digits</p> <p><strong>Example:</strong> <code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code></p> <p><strong>Usage:</strong> Debugging, detailed analysis, and when precision is required</p> <p><strong>Benefits:</strong> Shows complete address structure, easier to parse programmatically</p></div> <div class="format-explanation svelte-1sg0v44"><h4 class="svelte-1sg0v44"><span class="format-badge compressed svelte-1sg0v44">Compressed (Shortened) Format</span></h4> <p><strong>Structure:</strong> Uses :: to represent consecutive zero groups, removes leading zeros</p> <p><strong>Example:</strong> <code>2001:db8:85a3::8a2e:370:7334</code></p> <p><strong>Usage:</strong> Configuration files, user interfaces, documentation</p> <p><strong>Benefits:</strong> Shorter, more readable, standard representation</p></div> <div class="format-explanation svelte-1sg0v44"><h4 class="svelte-1sg0v44"><span class="format-badge rules svelte-1sg0v44">Compression Rules</span></h4> <p><strong>Double Colon (::):</strong> Represents one or more consecutive zero groups</p> <p><strong>Single Use:</strong> Only one :: allowed per address to avoid ambiguity</p> <p><strong>Leading Zeros:</strong> Remove leading zeros from each group (0001 → 1)</p> <p><strong>Preference:</strong> Compress the longest sequence of consecutive zeros</p></div></div></div></div> <div class="explainer-card no-hover svelte-1sg0v44"><h3 class="svelte-1sg0v44"><!> Conversion Use Cases & Applications</h3> <div class="explainer-content"><div class="usage-scenarios svelte-1sg0v44"><div class="usage-scenario svelte-1sg0v44"><h4 class="svelte-1sg0v44">Expand IPv6 Addresses</h4> <ul class="svelte-1sg0v44"><li class="svelte-1sg0v44"><strong>Network Analysis:</strong> Compare addresses byte-by-byte</li> <li class="svelte-1sg0v44"><strong>Database Storage:</strong> Consistent format for indexing</li> <li class="svelte-1sg0v44"><strong>Debugging:</strong> See complete address structure</li> <li class="svelte-1sg0v44"><strong>Programming:</strong> Easier parsing and manipulation</li> <li class="svelte-1sg0v44"><strong>Security:</strong> Avoid address obfuscation issues</li></ul></div> <div class="usage-scenario svelte-1sg0v44"><h4 class="svelte-1sg0v44">Compress IPv6 Addresses</h4> <ul class="svelte-1sg0v44"><li class="svelte-1sg0v44"><strong>User Interface:</strong> Shorter, more readable addresses</li> <li class="svelte-1sg0v44"><strong>Configuration:</strong> Cleaner config files and logs</li> <li class="svelte-1sg0v44"><strong>Documentation:</strong> Standard format for examples</li> <li class="svelte-1sg0v44"><strong>URLs:</strong> Shorter addresses in IPv6 URLs</li> <li class="svelte-1sg0v44"><strong>Network Equipment:</strong> Standard display format</li></ul></div> <div class="usage-scenario svelte-1sg0v44"><h4 class="svelte-1sg0v44">Real-world Scenarios</h4> <ul class="svelte-1sg0v44"><li class="svelte-1sg0v44"><strong>Network Monitoring:</strong> Consistent address formatting</li> <li class="svelte-1sg0v44"><strong>API Integration:</strong> Standardize input/output formats</li> <li class="svelte-1sg0v44"><strong>Data Migration:</strong> Convert between address formats</li> <li class="svelte-1sg0v44"><strong>Educational Tools:</strong> Demonstrate IPv6 structure</li> <li class="svelte-1sg0v44"><strong>Quality Assurance:</strong> Validate address representations</li></ul></div></div></div></div> <div class="explainer-card no-hover svelte-1sg0v44"><h3 class="svelte-1sg0v44"><!> Technical Examples & Standards</h3> <div class="explainer-content"><div class="examples-grid svelte-1sg0v44"><div class="example-item svelte-1sg0v44"><h4 class="svelte-1sg0v44">Common Address Types</h4> <div class="code-examples svelte-1sg0v44"><div class="code-pair svelte-1sg0v44"><div class="code-label svelte-1sg0v44">Loopback:</div> <div class="code-block svelte-1sg0v44"><code class="expanded svelte-1sg0v44">::1</code> <span class="arrow svelte-1sg0v44">↔</span> <code class="compressed svelte-1sg0v44">0000:0000:0000:0000:0000:0000:0000:0001</code></div></div> <div class="code-pair svelte-1sg0v44"><div class="code-label svelte-1sg0v44">Link-Local:</div> <div class="code-block svelte-1sg0v44"><code class="expanded svelte-1sg0v44">fe80::1</code> <span class="arrow svelte-1sg0v44">↔</span> <code class="compressed svelte-1sg0v44">fe80:0000:0000:0000:0000:0000:0000:0001</code></div></div> <div class="code-pair svelte-1sg0v44"><div class="code-label svelte-1sg0v44">Documentation:</div> <div class="code-block svelte-1sg0v44"><code class="expanded svelte-1sg0v44">2001:db8::</code> <span class="arrow svelte-1sg0v44">↔</span> <code class="compressed svelte-1sg0v44">2001:0db8:0000:0000:0000:0000:0000:0000</code></div></div></div></div> <div class="example-item svelte-1sg0v44"><h4 class="svelte-1sg0v44">Best Practices</h4> <ul class="svelte-1sg0v44"><li class="svelte-1sg0v44"><strong>RFC 5952:</strong> Follow standard compression guidelines</li> <li class="svelte-1sg0v44"><strong>Consistency:</strong> Use same format throughout applications</li> <li class="svelte-1sg0v44"><strong>Validation:</strong> Always validate both input and output</li> <li class="svelte-1sg0v44"><strong>Case Sensitivity:</strong> Lowercase preferred (RFC 5952)</li> <li class="svelte-1sg0v44"><strong>Leading Zeros:</strong> Always remove for compressed form</li></ul></div></div></div></div></div></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var h3 = $.child(div_2);
	var node_1 = $.child(h3);

	Icon(node_1, { name: 'info', size: 'md' });
	$.next();
	$.reset(h3);
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h3_1 = $.child(div_3);
	var node_2 = $.child(h3_1);

	Icon(node_2, { name: 'lightbulb', size: 'md' });
	$.next();
	$.reset(h3_1);
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var h3_2 = $.child(div_4);
	var node_3 = $.child(h3_2);

	Icon(node_3, { name: 'code', size: 'md' });
	$.next();
	$.reset(h3_2);
	$.next(2);
	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}