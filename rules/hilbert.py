import enum
import math
import random
import sys
import json

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


def make_square(order: int):
    if order == 0:
        return []
    else:
        prev_wire = make_square(order - 1)
        new_wire = []
        new_wire += [dir.symmetric_NW() for dir in prev_wire]
        new_wire.append(Direction.LEFT)
        new_wire += prev_wire[::]
        new_wire.append(Direction.UP)
        new_wire += prev_wire[::]
        new_wire.append(Direction.RIGHT)
        new_wire += [dir.symmetric_NE() for dir in prev_wire]
        return new_wire

def make_wire(order: int):
    return make_square(order)[(4**order - 1) // 3:]

def get_order_for_length(length: int):
    return math.ceil(math.log(3 * (length - 1) / 2 + 1, 4))

def make_wire_of_length(length: int):
    order = get_order_for_length(length)
    return make_wire(order)[:length - 1]

def make_configuration_for_word(w: str):
    length = len(w)
    wire = make_wire_of_length(length)
    configuration = []
    x, y = 0, 0
    dir_in = None
    for i, a in enumerate(w[:-1]):
        signals = [f"input_{a}"]
        if dir_in is not None:
            signals.append(f"wire_in_{dir_in.name}")
        d = wire[i]
        signals.append(f"wire_out_{d.name}")
        configuration.append((x, y, signals))
        if d == Direction.UP:
            y += 1
        elif d == Direction.RIGHT:
            x += 1
        elif d == Direction.DOWN:
            y -= 1
        elif d == Direction.LEFT:
            x -= 1
        dir_in = wire[i]
    configuration.append((x, y, [f"input_{w[-1]}", f"wire_in_{dir_in.name}"]))
    return configuration

def configuration_to_json(configuration):
    max_x = max(x for x, _, _ in configuration)
    max_y = max(y for _, y, _ in configuration)
    size = max(max_x, max_y) + 1
    return json.dumps({
        "version": "1",
        "size": [size, size],
        "signals": {
            f"{x},{y}": signals for x, y, signals in configuration
        }
    }, indent=2)

def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <word or length>")
        sys.exit(1)

    try:
        n = int(sys.argv[1])
        word = "".join(random.choice("ab") for _ in range(n))
    except ValueError:
        word = sys.argv[1]
    config = make_configuration_for_word(word)
    print(configuration_to_json(config))

if __name__ == "__main__":
    main()
