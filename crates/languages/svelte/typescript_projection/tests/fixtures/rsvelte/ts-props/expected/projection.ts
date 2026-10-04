;

	interface Props {
		name: string;
		count?: number;
	}

	let { name, count = 0 }: Props = $props();
	const shout = (s: string): string => s.toUpperCase();

;

() => {
  {
    svelteHTML.createElement("p", {});
    (shout(name));
    (count);
  }
};
export default __rsvelte_export_component<Props, {}, "">();
