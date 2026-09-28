import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetExpandedByDefault($$renderer) {
	CodeSnippet($$renderer, {
		type: 'multi',
		expanded: true,
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