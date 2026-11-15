;
import { type Snippet as File } from 'svelte';;
type $$ComponentProps = { header?: File };

;

function $$render() {
  
	

	let { header }: $$ComponentProps = $props();

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      (header ? 'with header' : 'no header');
    }
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const File__SvelteComponent_ = $$render();
type File__SvelteComponent_ = ReturnType<typeof File__SvelteComponent_>;
export default File__SvelteComponent_;
