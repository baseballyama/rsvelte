import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetWithWrapText_test($$renderer) {
	CodeSnippet($$renderer, {
		type: 'multi',
		wrapText: true,
		code: `node -v
npm -v
yarn -v
git --version
python --version
java -version
docker --version
kubectl version`
	});
}