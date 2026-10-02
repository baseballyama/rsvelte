import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Hi.Input($$renderer, {});
	$$renderer.push(`<!----> `);
	Hello.World.Input($$renderer, {});
	$$renderer.push(`<!----> `);
	Hello._World123.Input($$renderer, {});
	$$renderer.push(`<!----> `);
	hi.input($$renderer, {});
	$$renderer.push(`<!----> `);
	hello.world.input($$renderer, {});
	$$renderer.push(`<!----> `);
	hello._world123.input($$renderer, {});
	$$renderer.push(`<!---->`);
}