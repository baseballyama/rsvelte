import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Code_1($$anchor) {
	const code = `const sayHello = () => {
    console.log('Hello!');
}`;

	var div = root();
	var node = $.child(div);

	$.component(node, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, { lang: 'typescript', class: 'w-full', code });
	});

	$.reset(div);
	$.append($$anchor, div);
}