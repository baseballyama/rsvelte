import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class CustomError extends Error {
		constructor() {
			super();
			Object.defineProperty(this, "message", { value: "test" });
		}
	}

	throw new CustomError();

	$.pop();
}