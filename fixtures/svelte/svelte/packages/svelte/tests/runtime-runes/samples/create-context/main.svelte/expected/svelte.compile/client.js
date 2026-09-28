import 'svelte/internal/disclose-version';
import { createContext } from 'svelte';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

const [get, set, has] = createContext();
const [,, has_unset] = createContext();

export { get, has, has_unset };

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	set('hello');
	Child($$anchor, {});
	$.pop();
}