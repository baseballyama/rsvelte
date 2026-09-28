import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<select class="svelte-q12eab"><button aria-label="Selected value" class="svelte-q12eab"><selectedcontent class="svelte-q12eab"></selectedcontent></button>`);

	$$renderer.option(
		{ class: '' },
		($$renderer) => {
			$$renderer.push(`plain text`);
		},
		'svelte-q12eab'
	);

	$$renderer.option(
		{ class: '' },
		($$renderer) => {
			$$renderer.push(`<b class="svelte-q12eab">rich <i class="svelte-q12eab">italic</i></b><e class="svelte-q12eab">content</e>`);
		},
		'svelte-q12eab',
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`<!></select>`);
}