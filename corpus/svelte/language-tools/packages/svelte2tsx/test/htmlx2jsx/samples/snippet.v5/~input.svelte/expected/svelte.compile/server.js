import * as $ from 'svelte/internal/server';

function foo($$renderer, x) {
	$$renderer.push(`<div>asd${$.escape(x)}</div>`);
}

function bar($$renderer) {
	$$renderer.push(`<div>asd</div>`);
}

function await_inside($$renderer) {
	$.await($$renderer, foo, () => {}, (bar) => {
		$$renderer.push(`${$.escape(bar)}`);
	});

	$$renderer.push(`<!--]-->`);
}

function defaultValue($$renderer, x = '') {
	$$renderer.push(`<div>asd${$.escape(x)}</div>`);
}

function jsDoc($$renderer, a) {
	$$renderer.push(`<!---->${$.escape(a)}`);
}

export default function Input($$renderer) {
	foo($$renderer, 1);
	$$renderer.push(`<!----> `);
	bar($$renderer);
	$$renderer.push(`<!----> `);
	await_inside($$renderer);
	$$renderer.push(`<!----> `);

	{
		function bar($$renderer, x) {
			$$renderer.push(`<div>asd${$.escape(x)}</div>`);
		}

		Component($$renderer, {
			bar,
			children: ($$renderer) => {
				$$renderer.push(`<div>${$.escape(asd)}</div>`);
			},
			$$slots: { bar: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function row($$renderer, item) {
			$$renderer.push(`<!---->${$.escape(item)}`);
		}

		function await_inside($$renderer) {
			$.await($$renderer, foo, () => {}, (bar) => {
				$$renderer.push(`${$.escape(bar)}`);
			});

			$$renderer.push(`<!--]-->`);
		}

		List($$renderer, {
			data: [1, 2, 3],
			row,
			await_inside,
			$$slots: { row: true, await_inside: true }
		});
	}

	$$renderer.push(`<!----> `);

	List($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->implicit children`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function row1($$renderer, item) {
			$$renderer.push(`<!---->${$.escape(item)}`);
		}

		function row2($$renderer, item) {
			$$renderer.push(`<!---->${$.escape(item)}`);
		}

		List($$renderer, {
			data: [1, 2, 3],
			row1,
			row2,
			children: ($$renderer) => {
				$$renderer.push(`<p>html between snippets</p>`);
			},
			$$slots: { row1: true, row2: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);
	children($$renderer);
	$$renderer.push(`<!---->`);
}