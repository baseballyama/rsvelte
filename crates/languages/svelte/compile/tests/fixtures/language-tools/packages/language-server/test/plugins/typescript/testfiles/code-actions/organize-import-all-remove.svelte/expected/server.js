import * as $ from 'svelte/internal/server';
import { someStore } from './importing/a';
import { someStore as someOtherStore } from './importing/a';
import { someStore as someOtherStore2 } from './importing/a';
import { someStore as someOtherStore3 } from './importing/a';

export default function Organize_import_all_remove($$renderer) {}