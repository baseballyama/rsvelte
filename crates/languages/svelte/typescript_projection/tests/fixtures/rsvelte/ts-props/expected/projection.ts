;

	interface Props {
		name: string;
		count?: number;
	}

	type __rsvelte_props_type0 = Props;
let { name, count = 0 }: __rsvelte_props_type0 = $props();
	const shout = (s: string): string => s.toUpperCase();

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (shout(name));
    (count);
  }
};
const TsProps__SvelteComponent_ = __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
type TsProps__SvelteComponent_ = ReturnType<typeof TsProps__SvelteComponent_>;
export default TsProps__SvelteComponent_;
