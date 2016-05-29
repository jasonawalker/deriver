function simplifyHelper(t) {
    var tree = t.clone();
    var res = tree;

    if (t.left && t.left.equals(t.right)) {
        res = simplifyEquivalent(t);
    }

    if (res.equals(parseInput("$$$+###")) || res.equals(parseInput("$$$*###"))) {
        //TODO perhaps factor this out into own simplifer function
        res.switch();
    }

    for (var f in schemaFns[res.val]) {
        var parsed = parseInput(f);
        if (res.val === parsed.val) {
            if (res.equals(parsed)) {
                res = schemaFns[res.val][f](res);
            }


            // else if (res.val === '+' || res.val === '*') {
            //     //TODO instead of switching make eerything conform to certain rule with formalizer function or something
            //     if (res.equals(parsed.switch())) {
            //         res.switch();
            //         res = schemaFns[f](res);
            //         break;
            //     } else if (res.equals(parseInput("$$$*###") || res.equals(parseInput("$$$*###")))) {
            //         //TODO perhaps factor this out into own simplifer function
            //         res.switch();
            //         break;
            //     }
            // }
        }

    }

    return res;
}

function simplify(t) {
    if (!t.left && !t.right) return t;
    var s = simplifyHelper(t);
    if (s.equals(t)) {
        if (t.left) {
            t.left = simplify(t.left);
        }
        if (t.right) {
            t.right = simplify(t.right);
        }

        return simplifyHelper(t);
    } else {
        if (simplify(s.clone()).equals(s)) return s;
        else return simplify(simplify(s));
    }
}

var schemaFns = {
    "*": {
        "###*(###/$$$)": function(tree) {
            var res = new Tree('/');
            res.l(tree.left.val * tree.right.left.val);
            res.r(simplifyHelper(tree.right.right));
            return res;
        },
        "(1/$$$)*($$$)": function(tree) {
            tree.left.left = tree.right;
            return tree.left;
        },
        "###*(###*$$$)": function(tree) {
            var res = new Tree('*');
            res.l(tree.left.val * tree.right.left.val);
            res.r(simplifyHelper(tree.right.right));
            return res;
        },
        "###*($$$*###)": function(tree) {
            var res = new Tree('*');
            res.l(tree.left.val * tree.right.right.val);
            res.r(simplifyHelper(tree.right.left));
            return res;
        },
        "$$$*(-1*$$$)": function(tree) {
            tree.right.left = tree.left.clone();
            tree.left = new Tree(-1);
            return tree;
        },
        "###*###": function(tree) {
            return new Tree(tree.left.val * tree.right.val);
        },
        "0*$$$": function(tree) {
            return new Tree(0);
        },
        "1*$$$": function(tree) {
            return tree.right;
        }
    },
    "+": {
        "###+###": function(tree) {
            return new Tree(tree.left.val + tree.right.val);
        },
        "(###*$$$)+(###*$$$)": function(tree) {
            if (tree.left.right.equals(tree.right.right)) {
                var res = new Tree('*');
                res.l(tree.left.left.val + tree.right.left.val);
                res.r(tree.left.right);
                return res;
            } else {
                return tree;
            }
        },
        "(cosx)^2+(sinx)^2": function(tree) {
            return new Tree(1);
        },
        "(sinx)^2+(cosx)^2": function(tree) {
            return new Tree(1);
        }
    },
    "-": {
        "###-###": function(tree) {
            return new Tree(tree.left.val - tree.right.val);
        },
        "$$$-(-1*$$$)": function(tree) {
            tree.val = '+';
            tree.right = tree.right.right;
            return tree;
        }
    },
    "/": {
        "$$$/1": function(tree) {
            return tree.left;
        },
        "($$$*(x^###))/(x^###)": function(tree) {
            //TODO try moving this to the below function ... and then
            var numDegree = tree.left.right.right.val,
                denomDegree = tree.right.right.val;

            if (numDegree > denomDegree) {
                tree.left.right.right.val -= denomDegree;
                return tree.left;
            } else {
                tree.right.right.val -= numDegree;
                var res = new Tree('/');
                res.r(tree.right);
                res.l(tree.left.left);
                return res;
            }
        },
        "(x^###)/(x^###)": function(tree) {
            var res = new Tree('/'),
                st = new Tree('*');

            st.l(1);
            st.r(tree.left);
            res.l(st);
            res.r(tree.right);
            return this['($$$*(x^###))/(x^###)'](res);
        },
        "###/>>>": function(tree) {
            var r = trigIdentities.reciprocals[tree.right.val];
            var res = new Tree('*');
            res.l(tree.left);
            res.r(r);
            res.right.right = tree.right.right;
            return res;
        },
        "###/(>>>^###)": function(tree) {
            var degree = tree.right.right;
            var res = new Tree('*');
            res.l(tree.left);
            res.r('^');
            res.right.left = tree.right.left;
            res.right.left.val = trigIdentities.reciprocals[tree.right.left.val];
            res.right.right = degree;
            return res;
        }
    },
    "^": {
        "x^1": function(tree) {
            return new Tree('x');
        },
        "x^0": function(tree) {
            return new Tree('1');
        },
        "($$$)^(1/2)": function(tree) {
            var res = new Tree('sqrt');
            res.right = tree.left;
            return res;
        },
        "(sqrt($$$))^2": function(tree) {
            return tree.left.right;
        },
        "(###*x)^(###)": function(tree) {
            tree.left.left.val = Math.pow(tree.left.left.val, tree.right.val);
            return tree.left;
        }
    }
};



var trigIdentities = {
    reciprocals: {
        'sin': 'csc',
        'cos': 'sec',
        'tan': 'cot',
        'csc': 'sin',
        'sec': 'cos',
        'cot': 'tan'
    }
};

function simplifyEquivalent(tree) {
    for (var f in equivalenceFns) {
        if (parseInput(f).equals(tree)) {
            return equivalenceFns[f](tree);
        }
    }
    return tree;
}

var equivalenceFns = {
    "$$$+$$$": function(tree) {
        var res = new Tree("*");
        res.l(2);
        res.r(tree.right);
        return res;
    },
    "$$$*$$$": function(tree) {
        var res = new Tree("^");
        res.l(tree.left);
        res.r(2);
        return res;
    }
};
