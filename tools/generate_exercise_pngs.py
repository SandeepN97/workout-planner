from pathlib import Path
import math
import subprocess


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "exercises"
TMP = OUT / "_tmp"

EXERCISES = [
    ("barbell-bench-press", "push", "barbell"),
    ("incline-dumbbell-press", "push", "dumbbell"),
    ("weighted-chest-dips", "push", "dip"),
    ("seated-dumbbell-shoulder-press", "shoulder", "dumbbell"),
    ("cable-machine-lateral-raises", "shoulder", "cable"),
    ("rope-pushdowns", "triceps", "cable"),
    ("reverse-grip-pushdowns", "triceps", "cable"),
    ("romanian-deadlift", "legs", "barbell"),
    ("pull-ups-lat-pulldown", "pull", "cable"),
    ("chest-supported-dumbbell-row", "pull", "dumbbell"),
    ("rear-delt-cable-fly-reverse-pec-deck", "shoulder", "cable"),
    ("barbell-curl", "arms", "barbell"),
    ("hammer-curl", "arms", "dumbbell"),
    ("squats", "legs", "barbell"),
    ("leg-press", "legs", "machine"),
    ("lying-leg-curl", "legs", "machine"),
    ("standing-calf-raise", "legs", "machine"),
    ("weighted-hanging-leg-raise-cable-crunch", "core", "cable"),
    ("dumbbell-bench-press", "push", "dumbbell"),
    ("cable-chest-fly", "push", "cable"),
    ("seated-cable-row-neutral-grip", "pull", "cable"),
    ("cable-lateral-raise", "shoulder", "cable"),
    ("single-arm-rope-pushdown", "triceps", "cable"),
    ("face-pulls", "shoulder", "cable"),
    ("arnold-press", "shoulder", "dumbbell"),
    ("rear-delt-raises", "shoulder", "dumbbell"),
    ("preacher-curl-incline-dumbbell-curl", "arms", "dumbbell"),
    ("overhead-dumbbell-extension", "triceps", "dumbbell"),
    ("isometric-pushdown-hold", "triceps", "cable"),
]

PALETTES = {
    "push": ((239, 106, 74), (255, 238, 230)),
    "pull": ((37, 99, 235), (231, 239, 255)),
    "legs": ((15, 118, 110), (223, 245, 239)),
    "shoulder": ((124, 58, 237), (242, 235, 255)),
    "triceps": ((217, 154, 36), (255, 245, 220)),
    "arms": ((19, 34, 56), (233, 238, 247)),
    "core": ((14, 116, 144), (225, 246, 250)),
}

W, H = 640, 400


def put(img, x, y, color):
    if 0 <= x < W and 0 <= y < H:
        img[y][x] = color


def line(img, x1, y1, x2, y2, color, width=5):
    steps = max(abs(x2 - x1), abs(y2 - y1), 1)
    for i in range(steps + 1):
        t = i / steps
        x = round(x1 + (x2 - x1) * t)
        y = round(y1 + (y2 - y1) * t)
        for ox in range(-width, width + 1):
            for oy in range(-width, width + 1):
                if ox * ox + oy * oy <= width * width:
                    put(img, x + ox, y + oy, color)


def rect(img, x1, y1, x2, y2, color):
    for y in range(max(0, y1), min(H, y2)):
        for x in range(max(0, x1), min(W, x2)):
            put(img, x, y, color)


def circle(img, cx, cy, r, color):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(img, x, y, color)


def rounded_panel(img, x1, y1, x2, y2, color):
    rect(img, x1 + 24, y1, x2 - 24, y2, color)
    rect(img, x1, y1 + 24, x2, y2 - 24, color)
    circle(img, x1 + 24, y1 + 24, 24, color)
    circle(img, x2 - 24, y1 + 24, 24, color)
    circle(img, x1 + 24, y2 - 24, 24, color)
    circle(img, x2 - 24, y2 - 24, 24, color)


def draw_body(img, accent, variant):
    dark = (18, 27, 45)
    skin = (246, 183, 137)
    # bench/floor/machine base
    line(img, 90, 305, 550, 305, (194, 205, 220), 4)
    if variant in {"barbell", "dumbbell"}:
        line(img, 190, 250, 455, 250, (71, 85, 105), 8)
        rect(img, 155, 231, 188, 269, dark)
        rect(img, 457, 231, 490, 269, dark)
    if variant == "machine":
        rect(img, 455, 105, 485, 305, (51, 65, 85))
        rect(img, 405, 115, 530, 145, (203, 213, 225))
        rect(img, 410, 175, 520, 205, (203, 213, 225))
    if variant == "cable":
        rect(img, 470, 70, 500, 315, (51, 65, 85))
        line(img, 485, 88, 360, 190, (71, 85, 105), 3)
        circle(img, 485, 88, 11, accent)
    if variant == "dip":
        line(img, 190, 115, 190, 315, (51, 65, 85), 7)
        line(img, 450, 115, 450, 315, (51, 65, 85), 7)
        line(img, 160, 175, 265, 175, (51, 65, 85), 7)
        line(img, 375, 175, 480, 175, (51, 65, 85), 7)

    # athlete silhouette
    circle(img, 315, 128, 29, skin)
    line(img, 315, 160, 300, 226, dark, 13)
    line(img, 300, 190, 230, 245, dark, 11)
    line(img, 330, 190, 400, 245, dark, 11)
    line(img, 300, 226, 252, 300, dark, 12)
    line(img, 300, 226, 366, 300, dark, 12)
    circle(img, 230, 245, 14, accent)
    circle(img, 400, 245, 14, accent)

    # motion accents
    for i in range(4):
        y = 94 + i * 27
        line(img, 82, y, 142, y - 12, accent, 3)
        line(img, 508, y + 6, 566, y - 6, accent, 3)


def make_image(slug, category, variant):
    accent, pale = PALETTES[category]
    img = [[(255, 255, 255) for _ in range(W)] for _ in range(H)]
    for y in range(H):
        t = y / H
        bg = tuple(round(pale[i] * (1 - t) + 255 * t) for i in range(3))
        for x in range(W):
            img[y][x] = bg

    rounded_panel(img, 38, 34, 602, 360, (255, 255, 255))
    for radius, alpha_color in [(128, accent), (84, (255, 255, 255))]:
        circle(img, 514, 104, radius, alpha_color)
    draw_body(img, accent, variant)

    ppm = TMP / f"{slug}.ppm"
    png = OUT / f"{slug}.png"
    with ppm.open("w", encoding="ascii") as f:
        f.write(f"P3\n{W} {H}\n255\n")
        for row in img:
            f.write(" ".join(f"{r} {g} {b}" for r, g, b in row))
            f.write("\n")

    subprocess.run(["sips", "-s", "format", "png", str(ppm), "--out", str(png)], check=True, stdout=subprocess.DEVNULL)
    ppm.unlink()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    for slug, category, variant in EXERCISES:
        make_image(slug, category, variant)
    TMP.rmdir()
    print(f"Generated {len(EXERCISES)} exercise PNGs in {OUT}")


if __name__ == "__main__":
    main()
