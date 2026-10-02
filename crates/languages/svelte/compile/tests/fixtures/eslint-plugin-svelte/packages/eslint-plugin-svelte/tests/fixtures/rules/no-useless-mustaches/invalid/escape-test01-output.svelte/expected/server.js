import * as $ from 'svelte/internal/server';

export default function Escape_test01_output($$renderer) {
	$$renderer.push(`<!---->

 <div data-text=" 
"></div> \\\\
\\r
\\`);
}