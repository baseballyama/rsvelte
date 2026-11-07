import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (abc) {
		$$renderer.push(`<!--[0--><div>${$.escape(abc)}</div>`);
	} else if (1) {
		$$renderer.push('<!--[1-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (asd) {
		$$renderer.push(`<!--[0-->asdddddddddddddddd
  dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd`);
	} else if (asd) {
		$$renderer.push(`<!--[1-->dddddd`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}