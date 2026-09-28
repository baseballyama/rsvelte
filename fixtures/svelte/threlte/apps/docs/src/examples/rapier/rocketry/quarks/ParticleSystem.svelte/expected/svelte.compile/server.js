import * as $ from 'svelte/internal/server';
import { isInstanceOf, useParent } from '@threlte/core';
import { ParticleSystem } from 'three.quarks';
import { useBatchedRenderer } from './useBatchedRenderer';

export default function ParticleSystem_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { name, children, system = void 0, $$slots, $$events, ...rest } = $$props;
		const { renderer } = useBatchedRenderer();

		system = new ParticleSystem({ ...rest });

		const parent = useParent();

		children?.($$renderer, { system });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { system });
	});
}