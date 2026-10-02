mod each_block;
mod if_block;

use super::{ClientCompilationContext, NodeIdentifier, SourceLocation};

impl ClientCompilationContext<'_> {
    fn anchor_arrow(&mut self, body: &[NodeIdentifier]) -> NodeIdentifier {
        let block = self.out.block(body, SourceLocation::SYNTHETIC);
        let anchor = self.out.identifier("$$anchor");
        self.out
            .arrow(&[anchor], block, false, false, SourceLocation::SYNTHETIC)
    }
}
