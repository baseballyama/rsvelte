import * as $ from 'svelte/internal/server';
import Imported from './imported.svelte';
import { Works, Works2, Works3, Works4, DoesntWork } from './components';

export default function Input($$renderer) {
	Works($$renderer, {});
	$$renderer.push(`<!----> `);
	Imported($$renderer, {});
	$$renderer.push(`<!----> `);

	Works2($$renderer, {
		hi: 'hi',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo }) => {
				$$renderer.push(`<!---->${$.escape(foo.toLocaleLowerCase())}`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Works3($$renderer, {});
	$$renderer.push(`<!----> `);

	if (Works) {
		$$renderer.push('<!--[-->');
		Works($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Works2) {
		$$renderer.push('<!--[-->');

		Works2($$renderer, {
			hi: 'hi',
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { foo }) => {
					$$renderer.push(`<!---->${$.escape(foo.toLocaleLowerCase())}`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Works3) {
		$$renderer.push('<!--[-->');
		Works3($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	DoesntWork($$renderer, {});
	$$renderer.push(`<!----> `);
	Imported($$renderer, { propDoesntExist: true });
	$$renderer.push(`<!----> `);

	if (DoesntWork) {
		$$renderer.push('<!--[-->');
		DoesntWork($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	DoesntWork($$renderer, {
		foo: 'bar',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { etc }) => {
				$$renderer.push(`<!---->${$.escape(etc)}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	if (DoesntWork) {
		$$renderer.push('<!--[-->');

		DoesntWork($$renderer, {
			foo: 'bar',
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { etc }) => {
					$$renderer.push(`<!---->${$.escape(etc)}`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	Works4($$renderer, { foo: 'bar' });
	$$renderer.push(`<!----> `);

	if (Works4) {
		$$renderer.push('<!--[-->');
		Works4($$renderer, { foo: 'bar' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}