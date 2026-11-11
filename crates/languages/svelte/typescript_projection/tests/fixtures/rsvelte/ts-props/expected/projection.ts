;

	interface Props {
		name: string;
		count?: number;
	}

	let { name, count = 0 }: Props = $props();
	const shout = (s: string): string => s.toUpperCase();

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (shout(name));
    (count);
  }
};
const TsProps__SvelteComponent_ = __rsvelte_export_component<Props, {}, "">();
type TsProps__SvelteComponent_ = ReturnType<typeof TsProps__SvelteComponent_>;
export default TsProps__SvelteComponent_;
