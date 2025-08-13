from __future__ import annotations


from backend.app.core.merkle_audit import MerkleTree


def test_merkle_root_changes_with_append():
    tree = MerkleTree()
    assert tree.root() is None
    tree.append({"a": 1})
    r1 = tree.root()
    assert r1 is not None
    tree.append({"b": 2})
    r2 = tree.root()
    assert r2 is not None and r2 != r1


