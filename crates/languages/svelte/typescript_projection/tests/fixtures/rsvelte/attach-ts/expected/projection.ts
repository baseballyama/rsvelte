;
import type { Attachment } from 'svelte/attachments';;

;

function $$render() {
  
	

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

  async () => {
    {
      svelteHTML.createElement("p", {
        [Symbol("@attach")]: grow,
      });
    }
    {
      svelteHTML.createElement("button", {
        [Symbol("@attach")]: label('grow'),
        "onclick": () => (size += 1),
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
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const AttachTs__SvelteComponent_ = $$render();
type AttachTs__SvelteComponent_ = ReturnType<typeof AttachTs__SvelteComponent_>;
export default AttachTs__SvelteComponent_;
