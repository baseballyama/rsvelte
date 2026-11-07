import * as $ from 'svelte/internal/server';
import { browser, dev } from '$app/env';

export default function Message($$renderer) {
	$$renderer.push(`<p>Hello from the ${$.escape(browser ? 'client' : 'server')} in ${$.escape(dev ? 'dev' : 'prod')} mode!</p>`);
}