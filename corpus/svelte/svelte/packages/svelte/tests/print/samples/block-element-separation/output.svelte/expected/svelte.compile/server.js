import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$.head('q0jzpr', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Page Title</title>`);
		});
	});

	$$renderer.push(`<div>no space</div> `);
	Component($$renderer, {});
	$$renderer.push(`<!----> `);
	Component($$renderer, {});
	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>child</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div>after component</div> `);
	$$renderer.push(`<!--[-->`);

	{
		$$renderer.push(`<div>boundary content</div>`);
	}

	$$renderer.push(`<!--]-->`);
	$$renderer.push(` <div>after boundary</div> <div>after comment</div> <div>before comment</div> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<div>${$.escape(item)}</div>`);
	}

	$$renderer.push(`<!--]--> <div>after each</div> `);
	children($$renderer);
	$$renderer.push(`<!----> <div>after render</div> <div>before render</div> `);
	children($$renderer);
	$$renderer.push(`<!----> `);
	Component($$renderer, {});
	$$renderer.push(`<!----> <div>with spaces</div> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>child</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div>spaces after component</div> <div>spaces after comment</div> `);
	children($$renderer);
	$$renderer.push(`<!----> <div>spaces after render</div> `);
	Component($$renderer, {});
	$$renderer.push(`<!----> <div>newline between</div> <div>newline after comment</div> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];

		$$renderer.push(`<div>${$.escape(item)}</div>`);
	}

	$$renderer.push(`<!--]--> <div>newline after each</div> `);
	children($$renderer);
	$$renderer.push(`<!----> <div>after render</div>`);
}