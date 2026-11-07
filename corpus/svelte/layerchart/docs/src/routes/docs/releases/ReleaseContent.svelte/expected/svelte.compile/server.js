import * as $ from 'svelte/internal/server';

export default function ReleaseContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { release } = $$props;

		$$renderer.push(`<div class="release-content svelte-1jyaygr">${$.html(release.html)}</div>`);
	});
}