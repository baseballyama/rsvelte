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
const Module__SvelteComponent_ = __rsvelte_export_component();
export default Module__SvelteComponent_;
