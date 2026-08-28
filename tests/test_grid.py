from __future__ import annotations

from godlock.grid import GRID_SIZE, NODES, Airlock, MirageGrid


def test_grid_has_25_nodes_and_rotates() -> None:
    assert len(NODES) == 25
    assert GRID_SIZE == 25
    grid = MirageGrid(rotate_interval_s=0.0)
    seen = {grid.current_node() for _ in range(40)}
    assert grid.size == 25
    assert all(n.startswith("grid-") for n in grid.nodes)
    assert len(seen) > 1
    before = grid.current_node()
    after = grid.force_rotate()
    assert after != before


def test_airlock_ingress_not_equal_egress() -> None:
    airlock = Airlock(MirageGrid(rotate_interval_s=0.0))
    for _ in range(40):
        pair = airlock.open()
        assert pair.ingress_node != pair.egress_node
        assert pair.ingress_node in NODES
        assert pair.egress_node in NODES
