//! Operators, stored in a node's `flags` byte.

macro_rules! op_enum {
	($name:ident { $($variant:ident = $text:literal),* $(,)? }) => {
		#[derive(Clone, Copy, PartialEq, Eq, Debug)]
		#[repr(u8)]
		pub enum $name { $($variant),* }

		impl $name {
			pub const ALL: &'static [$name] = &[$($name::$variant),*];

			pub fn as_str(self) -> &'static str {
				match self { $($name::$variant => $text),* }
			}

			pub fn parse(s: &str) -> Option<$name> {
				match s { $($text => Some($name::$variant),)* _ => None }
			}

			#[inline]
			pub fn from_u8(v: u8) -> $name {
				Self::ALL[v as usize]
			}
		}
	};
}

op_enum!(BinOp {
    Eq = "==", NotEq = "!=", StrictEq = "===", StrictNotEq = "!==",
    Lt = "<", LtEq = "<=", Gt = ">", GtEq = ">=",
    Shl = "<<", Shr = ">>", UShr = ">>>",
    Add = "+", Sub = "-", Mul = "*", Div = "/", Rem = "%", Exp = "**",
    BitOr = "|", BitXor = "^", BitAnd = "&",
    In = "in", InstanceOf = "instanceof",
});

op_enum!(LogicalOp { Or = "||", And = "&&", Nullish = "??" });

op_enum!(UnaryOp { Not = "!", Neg = "-", Plus = "+", BitNot = "~", TypeOf = "typeof", Void = "void", Delete = "delete" });

op_enum!(UpdateOp { Inc = "++", Dec = "--" });

op_enum!(AssignOp {
    Assign = "=", Add = "+=", Sub = "-=", Mul = "*=", Div = "/=", Rem = "%=", Exp = "**=",
    Shl = "<<=", Shr = ">>=", UShr = ">>>=", BitOr = "|=", BitXor = "^=", BitAnd = "&=",
    Or = "||=", And = "&&=", Nullish = "??=",
});

impl BinOp {
    /// Binding power; higher binds tighter.
    pub fn precedence(self) -> u8 {
        use BinOp::*;
        match self {
            BitOr => 4,
            BitXor => 5,
            BitAnd => 6,
            Eq | NotEq | StrictEq | StrictNotEq => 7,
            Lt | LtEq | Gt | GtEq | In | InstanceOf => 8,
            Shl | Shr | UShr => 9,
            Add | Sub => 10,
            Mul | Div | Rem => 11,
            Exp => 12,
        }
    }
}

impl LogicalOp {
    pub fn precedence(self) -> u8 {
        match self {
            LogicalOp::Nullish => 1,
            LogicalOp::Or => 2,
            LogicalOp::And => 3,
        }
    }
}
