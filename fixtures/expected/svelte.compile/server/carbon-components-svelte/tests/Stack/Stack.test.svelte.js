import * as $ from 'svelte/internal/server';
import Stack from "carbon-components-svelte/Stack/Stack.svelte";

export default function Stack_test($$renderer) {
	const gaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(gaps);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let gap = each_array[$$index];

		Stack($$renderer, {
			gap,
			children: ($$renderer) => {
				$$renderer.push(`<p>gap-${$.escape(gap)}</p>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 1,
		children: ($$renderer) => {
			$$renderer.push(`<span>horizontal-gap-1</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<span>horizontal-gap-5</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 13,
		children: ($$renderer) => {
			$$renderer.push(`<span>horizontal-gap-13</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		gap: '200px',
		children: ($$renderer) => {
			$$renderer.push(`<p>custom-gap-200px</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		gap: '1.5rem',
		children: ($$renderer) => {
			$$renderer.push(`<p>custom-gap-1.5rem</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		tag: 'ul',
		gap: 3,
		children: ($$renderer) => {
			$$renderer.push(`<li>custom-tag-ul</li>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		tag: 'section',
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<div>custom-tag-section</div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		tag: 'ol',
		gap: 13,
		orientation: 'horizontal',
		children: ($$renderer) => {
			$$renderer.push(`<li>combined-props</li>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		gap: 0,
		children: ($$renderer) => {
			$$renderer.push(`<p>gap-0</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 0,
		children: ($$renderer) => {
			$$renderer.push(`<span>horizontal-gap-0</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		inline: true,
		children: ($$renderer) => {
			$$renderer.push(`<p>inline-default</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		inline: true,
		gap: 3,
		orientation: 'horizontal',
		children: ($$renderer) => {
			$$renderer.push(`<span>inline-horizontal</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		wrap: 'wrap',
		gap: 3,
		children: ($$renderer) => {
			$$renderer.push(`<span>wrap-wrap</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Stack($$renderer, {
		orientation: 'horizontal',
		wrap: 'wrap-reverse',
		gap: 3,
		children: ($$renderer) => {
			$$renderer.push(`<span>wrap-reverse</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}