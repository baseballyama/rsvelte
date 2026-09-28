import * as $ from 'svelte/internal/server';
import { createContext, mount } from 'svelte';
import Child from './Child.svelte';

const [get, set, has] = createContext();
const [,, has_unset] = createContext();

export { get, has, has_unset };

function Wrapper(Component) {
	return (...args) => {
		set('hello');

		return Component(...args);
	};
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div></div>`);
	});
}