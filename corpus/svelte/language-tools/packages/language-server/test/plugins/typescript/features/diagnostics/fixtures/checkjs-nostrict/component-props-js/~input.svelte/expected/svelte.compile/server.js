import * as $ from 'svelte/internal/server';
import ImportTs from '../props_to-import-ts.svelte';
import ImportJs from '../props_to-import-js.svelte';

export default function Input($$renderer) {
	ImportTs($$renderer, {});
	$$renderer.push(`<!----> `);
	ImportTs($$renderer, { required: undefined });
	$$renderer.push(`<!----> `);

	ImportTs($$renderer, {
		required: 'a',
		optional1: 'b',
		optional2: 'c',
		doesntExist: true
	});

	$$renderer.push(`<!----> `);
	ImportTs($$renderer, { required: true, optional1: true, optional2: true });
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, {});
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, { required: undefined });
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, { required: true, optional1: true, optional2: true });
	$$renderer.push(`<!----> `);
	ImportTs($$renderer, { required: 'a' });
	$$renderer.push(`<!----> `);
	ImportTs($$renderer, { required: 'a', optional1: 'b', optional2: 'c' });
	$$renderer.push(`<!----> `);
	ImportTs($$renderer, { required: 'a', optional1: 'b', optional2: undefined });
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, { required: 'a' });
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, { required: 'a', optional1: 'b', optional2: 'c' });
	$$renderer.push(`<!----> `);
	ImportJs($$renderer, { required: 'a', optional1: 'b', optional2: undefined });
	$$renderer.push(`<!---->`);
}