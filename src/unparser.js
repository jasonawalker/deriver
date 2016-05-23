function unparse(tree) {
    if(!tree.left && !tree.right) return tree.val;

    var right = unparse(tree.right),
        left = unparse(tree.left),
        middle = tree.val;

    if(TreePattern.OPS[tree.val] > TreePattern.OPS[tree.right.val]) {
        right = '(' + unparse(tree.right) + ')';
    }

    if(TreePattern.OPS[tree.val] > TreePattern.OPS[tree.left.val]) {
        left = '(' + unparse(tree.left) + ')';
    }

    if(
        tree.val === '*' &&
        typeof right === 'string' &&
        TreePattern.checkMultiply.join('|').indexOf(right[0]) > -1 //&&
        // ((left+"").split("").reverse()[0] !== 'x' || (right+"")[0] === '(')
    ) middle = '';

    if(tree.val === 'abs') {
        middle = '|';
        right = right + '|';
    }

    return (left || '') + middle + right;
}
