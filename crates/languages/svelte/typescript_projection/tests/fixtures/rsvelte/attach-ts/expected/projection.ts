;

	import type { Attachment } from 'svelte/attachments';

	let size = $state(12);

	const grow: Attachment<HTMLElement> = (node) => {
		node.style.fontSize = `${size}px`;
	};

	function label(text: string): Attachment<HTMLButtonElement> {
		return (node) => {
			node.ariaLabel = text;
		};
	}

;

{
  svelteHTML.createElement("p", {
    [Symbol("@attach")]: grow,
  });
}
{
  svelteHTML.createElement("button", {
    [Symbol("@attach")]: label('grow'),
    onclick: () => (size += 1),
  });
}
{
  svelteHTML.createElement("div", {
    [Symbol("@attach")]: (node: HTMLDivElement) => node.scrollTo(0, size),
  });
}
{
  svelteHTML.createElement("span", {
    [Symbol("@attach")]: label(size),
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
