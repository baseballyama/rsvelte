import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const libFreezesObjects = true;

	function someLibFunctionCreatingFroozenObject(value) {
		if (libFreezesObjects) {
			return Object.freeze({ inner: value });
		} else {
			return { inner: value };
		}
	}

	function someLibFunctionReturningInner(wrapped) {
		return wrapped.inner;
	}

	function atom(init = null) {
		let el = { value: someLibFunctionCreatingFroozenObject(init) };

		return {
			get value() {
				return someLibFunctionReturningInner(el.value);
			},

			set value(v) {
				el.value = someLibFunctionCreatingFroozenObject(v);
			}
		};
	}

	let val = atom('hello');

	$$renderer.push(`<input type="text"${$.attr('value', val.value)}/> <span>${$.escape(val.value)}</span>`);
}