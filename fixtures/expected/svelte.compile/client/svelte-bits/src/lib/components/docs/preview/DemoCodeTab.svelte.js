import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
import CliInstall from './CliInstall.svelte';
import CodeBlock from './CodeBlock.svelte';

var root = $.from_html(`<!> <h3 class="demo-title-extra">Usage</h3> <!> <h3 class="demo-title-extra">Component source</h3> <!>`, 1);

export default function DemoCodeTab($$anchor, $$props) {
	$.push($$props, true);

	/** Mirrors registry installs: omit internal `<!-- @svelte-bits -->` metadata. */
	const sourceForDocs = $.derived(() => stripSvelteBitsHeader($$props.source));

	var fragment = root();
	var node = $.first_child(fragment);

	CliInstall(node, {
		get slug() {
			return $$props.slug;
		}
	});

	var node_1 = $.sibling(node, 4);

	CodeBlock(node_1, {
		get code() {
			return $$props.usage;
		},
		language: 'svelte'
	});

	var node_2 = $.sibling(node_1, 4);

	CodeBlock(node_2, {
		get code() {
			return $.get(sourceForDocs);
		},
		language: 'svelte'
	});

	$.append($$anchor, fragment);
	$.pop();
}