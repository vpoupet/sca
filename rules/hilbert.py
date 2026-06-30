import enum


class Direction(enum.Enum):
    UP = 0
    RIGHT = 1
    DOWN = 2
    LEFT = 3

    def rotate_clockwise(self):
        return Direction((self.value + 1) % 4)

    def rotate_counterclockwise(self):
        return Direction((self.value - 1) % 4)

    def symmetric_NW(self):
        if self == Direction.UP:
            return Direction.LEFT
        elif self == Direction.RIGHT:
            return Direction.DOWN
        elif self == Direction.DOWN:
            return Direction.RIGHT
        elif self == Direction.LEFT:
            return Direction.UP

    def symmetric_NE(self):
        if self == Direction.UP:
            return Direction.RIGHT
        elif self == Direction.RIGHT:
            return Direction.UP
        elif self == Direction.DOWN:
            return Direction.LEFT
        elif self == Direction.LEFT:
            return Direction.DOWN


def make_wire(order: int):
    if order == 0:
        return [Direction.LEFT, Direction.UP, Direction.RIGHT]
    else:
        prev_wire = make_wire(order - 1)
        new_wire = []
        new_wire += [dir.symmetric_NW() for dir in prev_wire]
        new_wire.append(Direction.LEFT)
        new_wire += prev_wire[::]
        new_wire.append(Direction.UP)
        new_wire += prev_wire[::]
        new_wire.append(Direction.RIGHT)
        new_wire += [dir.symmetric_NE() for dir in prev_wire]
        return new_wire
