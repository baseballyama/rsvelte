import * as $ from 'svelte/internal/server';
import './_styles.css';
import './_manual.css?url';
import './_manual.css?raw';
import './_manual.css?inline';

export default function _page($$renderer) {
	$$renderer.push(`<div class="styled">this text is red</div> <div class="also-styled svelte-1hh6m33">this text is blue</div> <div class="overridden">this text is green</div> <div class="not">this text is black</div> <a href="/css/other">other</a>`);
}