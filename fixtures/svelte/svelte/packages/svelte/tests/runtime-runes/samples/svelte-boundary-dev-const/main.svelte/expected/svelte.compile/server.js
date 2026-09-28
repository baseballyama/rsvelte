import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ok = true } = $$props;

		function throwError() {
			throw new Error();
		}

		function throwErrorOnUpdate() {
			if (ok) {
				return "OK";
			} else {
				throwError();
			}
		}

		{
			function failed($$renderer) {
				$$renderer.push(`<p>BOOM</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<div>${$.escape(throwError())}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(` `);

		{
			function failed($$renderer) {
				$$renderer.push(`<p>BOOM</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					const result = throwError();

					$$renderer.push(`<div>${$.escape(result)}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(` `);

		{
			function failed($$renderer) {
				$$renderer.push(`<p>BOOM</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<div>${$.escape(throwErrorOnUpdate())}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(` `);

		{
			function failed($$renderer) {
				$$renderer.push(`<p>BOOM</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					const result = throwErrorOnUpdate();

					$$renderer.push(`<div>${$.escape(result)}</div>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}