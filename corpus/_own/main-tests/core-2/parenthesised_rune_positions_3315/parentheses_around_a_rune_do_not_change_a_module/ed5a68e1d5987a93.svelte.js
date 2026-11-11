let base = $state(1);
export class K { a = $state(1); b = (($derived(this.a + 1))); }
