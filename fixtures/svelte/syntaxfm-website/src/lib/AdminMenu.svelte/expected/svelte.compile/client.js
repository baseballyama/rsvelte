import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';
import { SideMenu } from '@leveluptuts/svelte-side-menu';
import { form_action } from './form_action';
import ThemeToggle from './theme/ThemeToggle.svelte';

var root = $.from_html(`<!> <div><form action="/?/dump_cache" method="POST"><button>Dump Cache</button></form></div>`, 1);

export default function AdminMenu($$anchor, $$props) {
	$.push($$props, true);

	SideMenu($$anchor, {
		top: '40px',
		links: [
			{ text: 'Admin' },
			{ text: 'Dashboard', path: '/admin' },
			{ text: 'Shows', path: '/admin/shows' },
			{ text: 'Video', path: '/admin/videos' },
			{ text: 'Video Import', path: '/admin/videos/import' },
			{ text: 'Transcripts', path: '/admin/transcripts' },
			{ text: 'Front End' },
			{ text: 'Homepage', path: '/' },
			{ text: 'Shows', path: '/podcast' }
		],

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ThemeToggle(node, {});

			var div = $.sibling(node, 2);
			var form = $.child(div);

			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}