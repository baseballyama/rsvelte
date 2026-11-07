import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {});
	$$renderer.push(`<!----> `);
	SomeLongComponentName($$renderer, {});
	$$renderer.push(`<!---->`);
}