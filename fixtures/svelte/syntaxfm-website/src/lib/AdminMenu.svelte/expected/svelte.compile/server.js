import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';
import { SideMenu } from '@leveluptuts/svelte-side-menu';
import { form_action } from './form_action';
import ThemeToggle from './theme/ThemeToggle.svelte';

export default function AdminMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		SideMenu($$renderer, {
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

			children: ($$renderer) => {
				ThemeToggle($$renderer, {});
				$$renderer.push(`<!----> <div><form action="/?/dump_cache" method="POST"><button>Dump Cache</button></form></div>`);
			},
			$$slots: { default: true }
		});
	});
}