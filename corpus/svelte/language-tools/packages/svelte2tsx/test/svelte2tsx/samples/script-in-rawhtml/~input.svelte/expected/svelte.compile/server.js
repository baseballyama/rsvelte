import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const schema = { key: "value" };

	$$renderer.push(`${$.html(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`)}`);
}