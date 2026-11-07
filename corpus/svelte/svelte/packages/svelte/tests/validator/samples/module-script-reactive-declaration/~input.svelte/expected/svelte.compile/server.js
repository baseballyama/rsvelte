import * as $ from 'svelte/internal/server';

let num = 2;
let square;

$: square = num * num;

export default function Input($$renderer) {}