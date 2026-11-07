import * as $ from 'svelte/internal/server';
import Legacy from './Legacy.svelte';
import Runes from './Runes.svelte';
import RunesGeneric from './RunesGeneric.svelte';

export default function Input($$renderer) {
	let bind_and_prop;
	let value = '';
	let only_bind;
	let can_bind = '';
	let readonly = '';
	let instance;

	instance.only_bind() === true;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Legacy($$renderer, {
			get bind_and_prop() {
				return bind_and_prop;
			},

			set bind_and_prop($$value) {
				bind_and_prop = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Legacy($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Legacy($$renderer, { value });
		$$renderer.push(`<!----> `);
		Legacy($$renderer, { bind_and_prop });
		$$renderer.push(`<!----> `);

		Runes($$renderer, {
			get can_bind() {
				return can_bind;
			},

			set can_bind($$value) {
				can_bind = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Runes($$renderer, { can_bind });
		$$renderer.push(`<!----> `);
		Runes($$renderer, { readonly });
		$$renderer.push(`<!----> `);

		Runes($$renderer, {
			get readonly() {
				return readonly;
			},

			set readonly($$value) {
				readonly = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Runes($$renderer, {
			get only_bind() {
				return only_bind;
			},

			set only_bind($$value) {
				only_bind = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Runes($$renderer, { only_bind });
		$$renderer.push(`<!----> `);

		RunesGeneric($$renderer, {
			get readonly() {
				return readonly;
			},

			set readonly($$value) {
				readonly = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RunesGeneric($$renderer, {
			get only_bind() {
				return only_bind;
			},

			set only_bind($$value) {
				only_bind = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		RunesGeneric($$renderer, { only_bind });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}