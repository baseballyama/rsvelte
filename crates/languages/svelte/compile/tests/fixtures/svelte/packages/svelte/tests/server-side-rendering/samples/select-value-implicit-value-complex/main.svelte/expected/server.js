import * as $ from 'svelte/internal/server';

function option($$renderer, val) {
	$$renderer.push(`<!---->${$.escape(val)}`);
}

export default function Main($$renderer) {
	$$renderer.select({ value: 'dog' }, ($$renderer) => {
		$$renderer.option(
			{},
			($$renderer) => {
				option($$renderer, "--Please choose an option--");
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$$renderer.option(
			{},
			($$renderer) => {
				option($$renderer, "dog");
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$$renderer.option(
			{},
			($$renderer) => {
				option($$renderer, "cat");
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);
	});
}