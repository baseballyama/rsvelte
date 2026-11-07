import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	$$renderer.push(`<head></head> <body></body> <window></window> <document></document> <element${$.attr('this', {})}></element> <options></options>`);
}