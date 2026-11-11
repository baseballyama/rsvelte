;
export const value="a";export function get(){return value;}
;

const local=get();
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": local,
    });
  }
};
const Module__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Module__SvelteComponent_ = ReturnType<typeof Module__SvelteComponent_>;
export default Module__SvelteComponent_;
