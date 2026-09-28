import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	/** @param {string} type */
	async function fail(type) {
		await fetch(`/errors/error-html/make-root-fail?type=${type}`);

		if (type === 'redirect') {
			location.assign(location.href + '/404');
		} else {
			location.reload();
		}
	}

	$$renderer.push(`<button>Unexpected</button> <button>Expected</button> <button>Redirect</button>`);
}