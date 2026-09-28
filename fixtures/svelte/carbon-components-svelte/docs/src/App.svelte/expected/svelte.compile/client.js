import 'svelte/internal/disclose-version';
import { createRouter, Router } from "@roxi/routify";
import routes from "../.routify/routes.default.js";
import * as $ from 'svelte/internal/client';

export const router = createRouter({ routes });

export default function App($$anchor, $$props) {
	$.push($$props, true);

	Router($$anchor, {
		get router() {
			return router;
		}
	});

	$.pop();
}