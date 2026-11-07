import * as $ from 'svelte/internal/server';
import { SomeImportedClass } from './some-class';

export default function Typedefinition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class SomeClass {}

		let someClassInstance1 = new SomeImportedClass();
		let someClassInstance2 = new SomeClass();
	});
}