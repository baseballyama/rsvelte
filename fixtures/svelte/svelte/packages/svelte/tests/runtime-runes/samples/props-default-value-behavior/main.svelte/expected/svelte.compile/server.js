import * as $ from 'svelte/internal/server';
import Inner from "./inner.svelte";

export default function Main($$renderer) {
	let readonly_undefined = void 0;
	let readonlyWithDefault_undefined = void 0;
	let binding_undefined = void 0;
	let readonly_defined = 0;
	let readonlyWithDefault_defined = 0;
	let binding_defined = 0;
	let bind_readonly_undefined = void 0;
	let bind_binding_undefined = void 0;
	let bind_readonly_defined = 0;
	let bind_binding_defined = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>props undefined:</p> `);

		Inner($$renderer, {
			readonly: readonly_undefined,
			readonlyWithDefault: readonlyWithDefault_undefined,
			binding: binding_undefined
		});

		$$renderer.push(`<!----> <p>props defined:</p> `);

		Inner($$renderer, {
			readonly: readonly_defined,
			readonlyWithDefault: readonlyWithDefault_defined,
			binding: binding_defined
		});

		$$renderer.push(`<!----> <p>bindings undefined:</p> `);

		Inner($$renderer, {
			readonlyWithDefault: readonlyWithDefault_undefined,
			get readonly() {
				return bind_readonly_undefined;
			},

			set readonly($$value) {
				bind_readonly_undefined = $$value;
				$$settled = false;
			},

			get binding() {
				return bind_binding_undefined;
			},

			set binding($$value) {
				bind_binding_undefined = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>bindings defined:</p> `);

		Inner($$renderer, {
			readonlyWithDefault: readonlyWithDefault_defined,
			get readonly() {
				return bind_readonly_defined;
			},

			set readonly($$value) {
				bind_readonly_defined = $$value;
				$$settled = false;
			},

			get binding() {
				return bind_binding_defined;
			},

			set binding($$value) {
				bind_binding_defined = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>Main:
	readonly_undefined: ${$.escape(readonly_undefined)}
	readonlyWithDefault_undefined: ${$.escape(readonlyWithDefault_undefined)}
	binding_undefined: ${$.escape(binding_undefined)}
	readonly_defined: ${$.escape(readonly_defined)}
	readonlyWithDefault_defined: ${$.escape(readonlyWithDefault_defined)}
	binding_defined: ${$.escape(binding_defined)}
	bind_readonly_undefined: ${$.escape(bind_readonly_undefined)}
	bind_binding_undefined: ${$.escape(bind_binding_undefined)}
	bind_readonly_defined: ${$.escape(bind_readonly_defined)}
	bind_binding_defined: ${$.escape(bind_binding_defined)}</p> <button>set everything to 10</button> <button>set everything to undefined</button>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}