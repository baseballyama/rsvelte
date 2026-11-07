import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<code>\`$&#123;foo}\\n\`</code> <!> <div title="\`\${foo}\\n\`">foo</div> <!> <div></div> <div>$dollars \`backticks\` pyramid /\\</div> <p></p>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.html(node, () => "`");

	var node_1 = $.sibling(node, 4);

	Widget(node_1, { value: '`${foo}\\n`' });

	var div = $.sibling(node_1, 2);

	div.textContent = '/ $clicks: 0 `tim$es` \\';

	var p = $.sibling(div, 4);

	p.textContent = '${\n	${\n	${';
	$.append($$anchor, fragment);
}