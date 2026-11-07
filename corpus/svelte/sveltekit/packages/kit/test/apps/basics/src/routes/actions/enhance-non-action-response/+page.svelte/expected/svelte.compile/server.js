import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer) {
	$$renderer.push(`<form method="POST" action="/actions/enhance-non-action-response/reject"><button class="json">Submit</button></form> <form method="POST" action="/actions/enhance-non-action-response/reject?body=html"><button class="html">Submit</button></form> <form method="POST" action="/actions/enhance-non-action-response/reject?body=empty"><button class="empty">Submit</button></form>`);
}