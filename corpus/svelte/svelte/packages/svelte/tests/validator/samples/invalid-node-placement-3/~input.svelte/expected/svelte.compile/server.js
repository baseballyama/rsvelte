import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<select>`);

	$$renderer.option({ value: '0' }, ($$renderer) => {
		$$renderer.push(`The`);
	});

	$$renderer.push(`<hr/>`);

	$$renderer.push(`<script>
		console.log("hei");
	</script>`);

	$$renderer.push(`<template>Cool</template>`);

	$$renderer.option({ value: '1' }, ($$renderer) => {
		$$renderer.push(`bug`);
	});

	$$renderer.push(`<!></select>`);
}