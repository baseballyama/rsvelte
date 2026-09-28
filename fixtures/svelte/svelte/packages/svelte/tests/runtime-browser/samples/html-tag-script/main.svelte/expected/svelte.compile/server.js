import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div></div> ${$.html(`<script>document.body.innerHTML = 'this should not be executed'</script>`)}`);
}