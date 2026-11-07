import * as $ from 'svelte/internal/server';
import ComponentPropsRune from './component-props-rune.svelte';
import { ComponentDef5 } from './ComponentDef';

export default function Component_props_completion_rune($$renderer) {
	ComponentPropsRune($$renderer, {});
	$$renderer.push(`<!----> `);
	ComponentDef5($$renderer, {});
	$$renderer.push(`<!---->`);
}