import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p${$.attr_class(foo)}></p> `);

	$.element($$renderer, foo, () => {
		$$renderer.push(`${$.attr_class(foo)}`);
	});

	$$renderer.push(`  `);
	Component($$renderer, { class: foo });
	$$renderer.push(`<!----> `);

	if (foo) {
		$$renderer.push('<!--[-->');
		foo($$renderer, { class: foo });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (foo) {
		$$renderer.push('<!--[0-->');
		Input($$renderer, { class: foo });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <custom-element${$.attr_class(foo)}></custom-element>`);
}