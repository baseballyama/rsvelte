import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<script-foo>foo</script-foo> <style-foo>foo</style-foo>`);
}