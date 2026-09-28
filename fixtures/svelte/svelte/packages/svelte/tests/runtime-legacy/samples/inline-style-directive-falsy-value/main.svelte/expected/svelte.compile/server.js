import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p${$.attr_style('', { '--a': 0 })}></p> <p${$.attr_style('', { '--b': false })}></p> <p${$.attr_style('', { '--c': '' })}></p> <p${$.attr_style('', { '--d': undefined })}></p> <p${$.attr_style('', { '--e': null })}></p>`);
}