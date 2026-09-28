import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';
import { createContext } from 'svelte';

const [get, set, has] = createContext();
const [,, has_unset] = createContext();

export { get, has, has_unset };

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		set('hello');
		Child($$renderer, {});
	});
}