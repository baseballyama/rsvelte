import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->unchanged`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->unchanged`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { foo }) {
			$$renderer.push(`<div>${$.escape(foo)}</div>`);
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { foo: bar }) {
			$$renderer.push(`<div>${$.escape(bar)}</div>`);
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { foo }) {
			$$renderer.push(`<div>${$.escape(foo)}</div>`);
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function named($$renderer) {
			$$renderer.push(`<div>x</div>`);
		}

		Component($$renderer, { named, $$slots: { named: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function named($$renderer) {
			$$renderer.push(`<div><p>multi</p> <p>line</p></div>`);
		}

		Component($$renderer, { named, $$slots: { named: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function named($$renderer) {
			$.element($$renderer, 'div', void 0, () => {
				$$renderer.push(`x`);
			});
		}

		Component($$renderer, { named, $$slots: { named: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function foo($$renderer, { foo }) {
			$$renderer.push(`<div>${$.escape(foo)}</div>`);
		}

		function bar($$renderer, { foo: bar }) {
			$$renderer.push(`<div>${$.escape(bar)}</div>`);
		}

		Component($$renderer, { foo, bar, $$slots: { foo: true, bar: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { foo }) {
			$$renderer.push(`<!---->${$.escape(foo)}`);
		}

		function named($$renderer) {
			$$renderer.push(`<div>x</div>`);
		}

		Component($$renderer, { children, named, $$slots: { default: true, named: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { foo }) {
			$$renderer.push(`<!---->${$.escape(foo)}`);
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function named($$renderer, { foo }) {
			$$renderer.push(`<!---->${$.escape(foo)}`);
		}

		Component($$renderer, { named, $$slots: { named: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function foo($$renderer) {
			$$renderer.push(`<div>foo</div>`);
		}

		function bar($$renderer) {
			$$renderer.push(`<div>bar</div>`);
		}

		Component($$renderer, {
			foo,
			bar,
			children: ($$renderer) => {
				$$renderer.push(`<!---->OMG WHY`);
			},
			$$slots: { foo: true, bar: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function foo($$renderer) {
			$$renderer.push(`<div>foo</div>`);
		}

		function bar($$renderer) {
			$$renderer.push(`<div>bar</div>`);
		}

		Component($$renderer, {
			foo,
			bar,
			children: ($$renderer) => {
				$$renderer.push(`<!---->If you do mix slots like this you're a monster`);
			},
			$$slots: { foo: true, bar: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function foo($$renderer) {
			$$renderer.push(`<div>foo</div>`);
		}

		function children($$renderer, { omg }) {
			$$renderer.push(`<!---->${$.escape(omg)} WHY`);
		}

		function bar($$renderer) {
			$$renderer.push(`<div>bar</div>`);
		}

		Component($$renderer, {
			foo,
			children,
			bar,
			$$slots: { foo: true, default: true, bar: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { monster }) {
			$$renderer.push(`<!---->If you do mix slots like this
         
    you're a ${$.escape(monster)}`);
		}

		function foo($$renderer) {
			$$renderer.push(`<div>foo</div>`);
		}

		function bar($$renderer) {
			$$renderer.push(`<div>bar</div>`);
		}

		Component($$renderer, {
			children,
			foo,
			bar,
			$$slots: { default: true, foo: true, bar: true }
		});
	}

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>should be children</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			function children($$renderer, { with_prop }) {
				$$renderer.push(`<!---->should be children ${$.escape(with_prop)} too`);
			}

			$$renderer.push(`<span></span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <c-e><div slot="named">unchanged</div></c-e>`);
}