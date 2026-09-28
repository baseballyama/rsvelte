import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div role="presentation"></div> <div role="button" tabindex="-1"></div> <div role="listitem" aria-hidden="true"></div> <button>click me</button> <dialog>alert</dialog> <h1 contenteditable="true">Heading</h1> <h1>Heading</h1> <div role="listitem"></div> <h1>Heading</h1> <h1 role="banner">Heading</h1> <p></p> <div role="paragraph"></div>`);
}