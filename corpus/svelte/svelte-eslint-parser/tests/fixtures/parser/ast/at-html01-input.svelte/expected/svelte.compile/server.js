import * as $ from 'svelte/internal/server';

export default function At_html01_input($$renderer) {
	$$renderer.push(`${$.html(`<script>var x = ${50}</script>`)}`);
}