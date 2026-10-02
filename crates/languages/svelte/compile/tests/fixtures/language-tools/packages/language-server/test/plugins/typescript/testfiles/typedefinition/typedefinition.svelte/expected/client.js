import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SomeImportedClass } from './some-class';

export default function Typedefinition($$anchor, $$props) {
	$.push($$props, true);

	class SomeClass {}

	let someClassInstance1 = new SomeImportedClass();
	let someClassInstance2 = new SomeClass();

	$.pop();
}