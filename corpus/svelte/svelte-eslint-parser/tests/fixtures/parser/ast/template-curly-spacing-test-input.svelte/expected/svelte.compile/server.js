import * as $ from 'svelte/internal/server';

export default function Template_curly_spacing_test_input($$renderer) {
	const item = {};

	$$renderer.push(`<li${$.attr_class(`bytemd-toc-${item.level}`)}></li>`);
}