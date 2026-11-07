import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class CustomError extends Error {
			constructor() {
				super();
				Object.defineProperty(this, "message", { value: "test" });
			}
		}

		throw new CustomError();
	});
}