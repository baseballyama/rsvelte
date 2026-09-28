import * as $ from 'svelte/internal/server';
import { T, useParentObject3D, useThrelte } from '@threlte/core';
import { Group } from 'three';
import { createSuspenseContext } from './context.js';

export default function Suspense($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			final = false,
			onload,
			onsuspend,
			onerror,
			error,
			fallback,
			children
		} = $$props;

		const { suspended, errors, setFinal } = createSuspenseContext({ final });
		const { invalidate } = useThrelte();
		const group = new Group();
		const parent = useParentObject3D();

		T($$renderer, {
			is: // we don't have a parent, so we can't add ourselves to it
			// if the component is suspended or has errors, we remove ourselves from the parent
			group,
			attach: false,
			children: ($$renderer) => {
				children?.($$renderer, {
					suspended: $.store_get($$store_subs ??= {}, '$suspended', suspended),
					errors: $.store_get($$store_subs ??= {}, '$errors', errors)
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if ($.store_get($$store_subs ??= {}, '$errors', errors).length) {
			$$renderer.push('<!--[0-->');
			error?.($$renderer, { errors: $.store_get($$store_subs ??= {}, '$errors', errors) });
			$$renderer.push(`<!---->`);
		} else if ($.store_get($$store_subs ??= {}, '$suspended', suspended)) {
			$$renderer.push('<!--[1-->');
			fallback?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}