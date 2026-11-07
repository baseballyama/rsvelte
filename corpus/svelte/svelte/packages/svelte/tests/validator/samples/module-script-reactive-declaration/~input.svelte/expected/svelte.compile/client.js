import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let num = 2;
let square;

$: square = num * num;

export default function Input($$anchor) {}