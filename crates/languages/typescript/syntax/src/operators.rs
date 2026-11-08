//! Operators, stored in a node's `flags` byte.

macro_rules! operator_enum {
	($name:ident { $($variant:ident = $text:literal),* $(,)? }) => {
		#[derive(Clone, Copy, PartialEq, Eq, Debug)]
		#[repr(u8)]
		pub enum $name { $($variant),* }

		impl $name {
			pub const ALL: &'static [$name] = &[$($name::$variant),*];

			pub const fn as_str(self) -> &'static str {
				match self { $($name::$variant => $text),* }
			}

			pub fn parse(s: &str) -> Option<$name> {
				match s { $($text => Some($name::$variant),)* _ => None }
			}

			#[inline]
			pub const fn from_u8(v: u8) -> $name {
				Self::ALL[v as usize]
			}
		}
	};
}

operator_enum!(BinaryOperator {
    Eq = "==", NotEq = "!=", StrictEq = "===", StrictNotEq = "!==",
    Lt = "<", LtEq = "<=", Gt = ">", GtEq = ">=",
    Shl = "<<", Shr = ">>", UShr = ">>>",
    Add = "+", Sub = "-", Mul = "*", Div = "/", Remainder = "%", Exp = "**",
    BitOr = "|", BitXor = "^", BitAnd = "&",
    In = "in", InstanceOf = "instanceof",
});

operator_enum!(LogicalOperator { Or = "||", And = "&&", Nullish = "??" });

operator_enum!(UnaryOperator { Not = "!", Neg = "-", Plus = "+", BitNot = "~", TypeOf = "typeof", Void = "void", Delete = "delete" });

operator_enum!(UpdateOperator { Inc = "++", Dec = "--" });

operator_enum!(AssignmentOperator {
    Assign = "=", Add = "+=", Sub = "-=", Mul = "*=", Div = "/=", Remainder = "%=", Exp = "**=",
    Shl = "<<=", Shr = ">>=", UShr = ">>>=", BitOr = "|=", BitXor = "^=", BitAnd = "&=",
    Or = "||=", And = "&&=", Nullish = "??=",
});

impl BinaryOperator {
    /// Binding power; higher binds tighter.
    #[must_use]
    pub const fn precedence(self) -> u8 {
        use BinaryOperator::{
            Add, BitAnd, BitOr, BitXor, Div, Eq, Exp, Gt, GtEq, In, InstanceOf, Lt, LtEq, Mul,
            NotEq, Remainder, Shl, Shr, StrictEq, StrictNotEq, Sub, UShr,
        };
        match self {
            BitOr => 4,
            BitXor => 5,
            BitAnd => 6,
            Eq | NotEq | StrictEq | StrictNotEq => 7,
            Lt | LtEq | Gt | GtEq | In | InstanceOf => 8,
            Shl | Shr | UShr => 9,
            Add | Sub => 10,
            Mul | Div | Remainder => 11,
            Exp => 12,
        }
    }
}

impl LogicalOperator {
    #[must_use]
    pub const fn precedence(self) -> u8 {
        match self {
            Self::Nullish => 1,
            Self::Or => 2,
            Self::And => 3,
        }
    }
}
