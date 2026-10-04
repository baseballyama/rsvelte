#![expect(clippy::print_stdout, reason = "reports the measured memory layout")]

use rsvelte_svelte::compilation::compiler_syntax_tree::{Attribute, Node};
use rsvelte_svelte_compile::render_plan::{Cleaned, Item, Region};

fn main() {
    println!(
        "Node: {} bytes, alignment {}",
        size_of::<Node>(),
        align_of::<Node>()
    );
    println!(
        "Node fields: kind={}, span={}, parent={}",
        std::mem::offset_of!(Node, kind),
        std::mem::offset_of!(Node, span),
        std::mem::offset_of!(Node, parent)
    );
    println!(
        "Attribute: {} bytes, alignment {}",
        size_of::<Attribute>(),
        align_of::<Attribute>()
    );
    println!("Item: {} bytes", size_of::<Item<'static>>());
    println!("Cleaned: {} bytes", size_of::<Cleaned<'static>>());
    println!("Region: {} bytes", size_of::<Region>());
    println!(
        "Name map payload: String={}, Box<str>={}",
        size_of::<(String, u32)>(),
        size_of::<(Box<str>, u32)>()
    );
    println!(
        "Name set payload: String={}, Box<str>={}",
        size_of::<String>(),
        size_of::<Box<str>>()
    );
}
