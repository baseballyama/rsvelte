let count = $state(0); // count: number, $state(0): 0
const doubled = $derived(count * 2); // doubled: number, $derived(count * 2): number

export function increment() { // increment: () => void
  count += 1; // count: number
}

$effect(() => { // $effect(() => { console.log({ count, doubled }); return () => { console.log("cleanup"); }; }): void
  console.log({ count, doubled });

  return () => {
    console.log("cleanup");
  };
});
