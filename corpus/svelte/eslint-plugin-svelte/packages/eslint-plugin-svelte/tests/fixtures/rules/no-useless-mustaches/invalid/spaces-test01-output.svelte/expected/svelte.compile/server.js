import * as $ from 'svelte/internal/server';

export default function Spaces_test01_output($$renderer) {
	$$renderer.push(`<!---->foo
foo <div data-text="foo '"></div>`);
}