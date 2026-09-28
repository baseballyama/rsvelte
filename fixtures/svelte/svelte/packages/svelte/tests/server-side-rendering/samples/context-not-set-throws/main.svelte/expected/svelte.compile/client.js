import 'svelte/internal/disclose-version';
import { createContext } from 'svelte';
import * as $ from 'svelte/internal/client';

const [get] = createContext();

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	get();
	$.pop();
}