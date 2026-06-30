#!/usr/bin/env python3
import argparse
import math
from pathlib import Path


def marked_cells(n: int) -> set[tuple[int, int]]:
    cells: set[tuple[int, int]] = set()

    for k in range(n + 1):
        x = n - k
        for y in range(
            math.isqrt(2*k*x + k*k),
            math.isqrt(2*(k+1)*x + (k+1)*(k+1))):
                cells.add((x, y))

    return cells


def svg_cell_rect(a: int, b: int, grid_size: int, cell_size: int, margin: int) -> tuple[int, int, int, int]:
    """
    Convert mathematical cell coordinates (a,b), with b increasing upward,
    to SVG rectangle coordinates, where y increases downward.
    """
    x = margin + a * cell_size
    y = margin + (grid_size - 1 - b) * cell_size
    return x, y, cell_size, cell_size


def generate_svg(n: int, output: Path, cell_size: int = 32, margin: int = 24) -> None:
    grid_size = n + 1
    width = 2 * margin + grid_size * cell_size
    height = 2 * margin + grid_size * cell_size

    cells = marked_cells(n)

    svg: list[str] = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    svg.append('<rect width="100%" height="100%" fill="white"/>')

    # Mark selected cells.
    for a, b in sorted(cells):
        x, y, w, h = svg_cell_rect(a, b, grid_size, cell_size, margin)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#8ecae6" opacity="0.75"/>')

    # Draw grid.
    grid_left = margin
    grid_top = margin
    grid_right = margin + grid_size * cell_size
    grid_bottom = margin + grid_size * cell_size

    for i in range(grid_size + 1):
        x = margin + i * cell_size
        y = margin + i * cell_size
        svg.append(f'<line x1="{x}" y1="{grid_top}" x2="{x}" y2="{grid_bottom}" stroke="#999" stroke-width="1"/>')
        svg.append(f'<line x1="{grid_left}" y1="{y}" x2="{grid_right}" y2="{y}" stroke="#999" stroke-width="1"/>')

    # Outer border.
    svg.append(f'<rect x="{grid_left}" y="{grid_top}" width="{grid_size * cell_size}" '
               f'height="{grid_size * cell_size}" fill="none" stroke="black" stroke-width="2"/>')

    svg.append('</svg>')

    output.write_text("\n".join(svg), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate an SVG grid marking the floor-discrete quarter circle of radius n."
    )
    parser.add_argument("n", type=int, help="Nonnegative integer radius.")
    parser.add_argument("-o", "--output", default=None, help="Output SVG filename.")
    parser.add_argument("--cell-size", type=int, default=32, help="Cell size in SVG pixels.")
    parser.add_argument("--margin", type=int, default=24, help="SVG margin in pixels.")

    args = parser.parse_args()

    if args.n < 0:
        raise SystemExit("Error: n must be nonnegative.")

    output = Path(args.output) if args.output else Path(f"quarter_circle_n{args.n}.svg")
    generate_svg(args.n, output, args.cell_size, args.margin)

    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
