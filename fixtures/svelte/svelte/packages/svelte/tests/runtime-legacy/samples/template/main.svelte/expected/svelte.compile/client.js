import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<template id="t1"><div>foo</div></template> <template id="t2">123</template> <template id="t3">1<!>1</template>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var template = $.sibling($.first_child(fragment), 4);

	$.hydrate_template(template);

	var node = $.sibling($.child(template.content));

	$.html(node, () => '<b>B</b>');
	$.next();
	$.reset(template);
	$.append($$anchor, fragment);
}