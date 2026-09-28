import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetWithHideShowMore_test($$renderer) {
	CodeSnippet($$renderer, {
		type: 'multi',
		showMoreLess: false,
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