import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<script-foo>foo</script-foo> <style-foo>foo</style-foo>`);
	// bar
}