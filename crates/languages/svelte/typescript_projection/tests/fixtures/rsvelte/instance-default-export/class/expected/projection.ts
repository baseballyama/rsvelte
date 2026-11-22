;
function $$render() {
  
 default class A implements B {}

;

  return __rsvelte_export_isomorphic<{
    A?: typeof A;
  }, { [evt: string]: CustomEvent<any> }, {
    A: typeof A;
  }, string>()({});
}
const Class__SvelteComponent_ = $$render();
type Class__SvelteComponent_ = InstanceType<typeof Class__SvelteComponent_>;
export default Class__SvelteComponent_;
