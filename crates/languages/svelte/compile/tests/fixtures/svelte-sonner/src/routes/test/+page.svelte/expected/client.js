import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Toaster, toast } from '$lib/index.js';
import CustomIcon from './CustomIcon.svelte';
import WideDescription from './WideDescription.svelte';

var root = $.from_html(`<!> <!> <main><button data-testid="default-button">Default</button> <button data-testid="success">Success</button> <button data-testid="promise-custom-icon">Promise with custom icon</button> <button data-testid="dismiss-and-recreate">Dismiss and recreate</button> <button data-testid="component-description">Wide description</button> <button data-testid="action">Action</button> <button data-testid="toast-to-secondary">To secondary toaster</button></main>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const params = page.url.searchParams;
	const position = params.get('position') ?? 'bottom-right';
	const gap = params.has('gap') ? Number(params.get('gap')) : undefined;
	const swipeDirections = params.get('swipeDirections')?.split(',');
	const secondToaster = params.has('secondToaster');

	// Runs during component init, before the <Toaster /> below has mounted
	if (params.has('toastOnMount')) {
		toast('Toast rendered on mount');
	}

	function promiseWithCustomIcon() {
		toast.promise(new Promise((resolve) => setTimeout(resolve, 200)), { loading: 'Loading...', success: 'Loaded', icon: CustomIcon });
	}

	function dismissAndRecreate() {
		const id = toast('Original toast');

		toast.dismiss(id);

		// recreate while the exit-animation removal is still pending
		setTimeout(() => toast('Remounted toast', { id }), 100);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Toaster(node, {
		get position() {
			return position;
		},

		get gap() {
			return gap;
		},

		get swipeDirections() {
			return swipeDirections;
		},

		toastOptions: {
			classes: {
				default: 'default-toast-classname',
				success: 'success-toast-classname'
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Toaster($$anchor, { id: 'secondary', position: 'top-left' });
		};

		$.if(node_1, ($$render) => {
			if (secondToaster) $$render(consequent);
		});
	}

	var main = $.sibling(node_1, 2);
	var button = $.child(main);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);

	$.reset(main);
	$.delegated('click', button, () => toast('My default toast'));
	$.delegated('click', button_1, () => toast.success('My success toast'));
	$.delegated('click', button_2, promiseWithCustomIcon);
	$.delegated('click', button_3, dismissAndRecreate);
	$.delegated('click', button_4, () => toast('Custom title', { description: WideDescription }));
	$.delegated('click', button_5, () => toast('My message', { action: { label: 'Action', onClick: () => {} } }));
	$.delegated('click', button_6, () => toast('Secondary toast', { toasterId: 'secondary' }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);