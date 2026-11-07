import * as $ from 'svelte/internal/server';

import {
	numValue,
	strValue,
	anyValue,
	nullableValue,
	hasSubscribe1,
	hasSubscribe2,
	hasSubscribe3
} from '../../ts/non-store';

import { get } from 'svelte/store';

export default function Ts_non_store01_input($$renderer) {
	$$renderer.push(`<p>${$.escape(numValue)}</p> <p>${$.escape(strValue)}</p> <p>${$.escape(anyValue)}</p> <p>${$.escape(nullableValue)}</p> <p>${$.escape(hasSubscribe1)}</p> <p>${$.escape(hasSubscribe2)}</p> <p>${$.escape(hasSubscribe3)}</p>`);
}