;
let show = $state(true);
;

async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    if (show) {
      {
        svelteHTML.createElement("title", {});
      }
      {
        svelteHTML.createElement("meta", {
          "name": "test",
          "content": "shown",
        });
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const HeadNested__SvelteComponent_ = __rsvelte_export_component();
export default HeadNested__SvelteComponent_;
