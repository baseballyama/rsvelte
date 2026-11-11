;

	let { p = 1 }: typeof __rsvelte_public_props0 = $props();
	let a = 1;
	let s = $state(0);
	let f = () => 1;
	class K {}
	let _class = '';
	

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  p: 1,
}, false);
async () => {
  {
    svelteHTML.createElement("div", {
      "class": _class,
      "onclick": f,
    });
    (a);
    (s);
    (p);
  }
};
const ExportSpecifiersUnwritten__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {
  a: typeof a;
  s: typeof s;
  p: typeof p;
  f: typeof f;
  K: typeof K;
  class: typeof _class;
}, "">();
type ExportSpecifiersUnwritten__SvelteComponent_ = ReturnType<typeof ExportSpecifiersUnwritten__SvelteComponent_>;
export default ExportSpecifiersUnwritten__SvelteComponent_;
