;
interface Props {
		name: string;
		count?: number;
	};

;

function $$render() {
  
	

	type __rsvelte_props_type0 = Props;
let { name, count = 0 }: __rsvelte_props_type0 = $props();
	const shout = (s: string): string => s.toUpperCase();

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      shout(name);
      count;
    }
  };
  return __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
}
const TsProps__SvelteComponent_ = $$render();
type TsProps__SvelteComponent_ = ReturnType<typeof TsProps__SvelteComponent_>;
export default TsProps__SvelteComponent_;
