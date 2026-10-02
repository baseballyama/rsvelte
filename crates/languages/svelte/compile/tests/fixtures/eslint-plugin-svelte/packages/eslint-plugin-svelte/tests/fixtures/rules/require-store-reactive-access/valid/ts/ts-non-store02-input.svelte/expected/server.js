import * as $ from 'svelte/internal/server';
import * as nonStore from '../../ts/non-store';
import { get } from 'svelte/store';

export default function Ts_non_store02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>${$.escape(nonStore.numValue)}</p> <p>${$.escape(nonStore.strValue)}</p> <p>${$.escape(nonStore.anyValue)}</p> <p>${$.escape(nonStore.nullableValue)}</p> <p>${$.escape(nonStore.hasSubscribe1)}</p> <p>${$.escape(nonStore.hasSubscribe2)}</p> <p>${$.escape(nonStore.hasSubscribe3)}</p>`);
	});
}