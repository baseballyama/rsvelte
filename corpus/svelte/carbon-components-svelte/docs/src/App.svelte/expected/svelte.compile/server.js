import * as $ from 'svelte/internal/server';
import { createRouter, Router } from "@roxi/routify";
import routes from "../.routify/routes.default.js";

export const router = createRouter({ routes });

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Router($$renderer, { router });
	});
}