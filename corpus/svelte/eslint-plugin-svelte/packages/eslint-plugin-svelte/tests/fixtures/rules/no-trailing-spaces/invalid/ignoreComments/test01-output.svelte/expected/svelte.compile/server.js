import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	const str = `
  
`;

	// line comment  
	/**  
	 * block comment  
	 */
	/**
	 * block comment2  
	 */
	const a = 42;

	$$renderer.push(`<span>Text</span> <span>Text</span> <span>Text</span> <span><span>Text</span></span>`);
	// empty line
	// empty line
}