import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet } from "carbon-components-svelte";

export default function CodeSnippetDisabledMulti($$anchor) {
	let comment = "> carbon-components-svelte is a Svelte component library that implements the [Carbon Design System](https://github.com/carbon-design-system), an open source design system by IBM.\n\n> A design system can facilitate frontend development and prototyping because it is encourages reuse, consistency, and extensibility.\n";

	CodeSnippet($$anchor, { disabled: true, type: 'multi', code: comment });
}