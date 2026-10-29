// Draws the background as a Ravenna-style mosaic, at any size.
// Tesserae are laid in rings that follow the frame inward (the mosaicist's
// "andamento"), so the field calms down around the locution. Gold tesserae
// are set at slight tilts and catch the light as the pointer moves.

const Mosaic = (() => {
	const THEMES = {
		la: { field: [352, 60, 22], fieldDeep: [350, 64, 15], grout: "#2a0910" },
		grc: { field: [228, 56, 23], fieldDeep: [230, 62, 14], grout: "#090f2e" },
	};
	const GOLD = [43, 64, 56];

	// Small seeded PRNG, so the same day always gives the same mosaic
	function random(seed) {
		let t = seed >>> 0;
		return () => {
			t += 0x6d2b79f5;
			let r = Math.imul(t ^ (t >>> 15), 1 | t);
			r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
			return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
		};
	}

	// Point and tangent angle at distance s along a rounded rectangle
	function roundRectPath(x, y, w, h, r) {
		r = Math.max(0, Math.min(r, w / 2, h / 2));
		const sw = w - 2 * r;
		const sh = h - 2 * r;
		const arc = (Math.PI / 2) * r;
		const corner = (cx, cy, start, t) => {
			const a = start + (r ? t / r : 0);
			return [cx + r * Math.cos(a), cy + r * Math.sin(a), a + Math.PI / 2];
		};
		const segments = [
			{ len: sw, at: (t) => [x + r + t, y, 0] },
			{ len: arc, at: (t) => corner(x + w - r, y + r, -Math.PI / 2, t) },
			{ len: sh, at: (t) => [x + w, y + r + t, Math.PI / 2] },
			{ len: arc, at: (t) => corner(x + w - r, y + h - r, 0, t) },
			{ len: sw, at: (t) => [x + w - r - t, y + h, Math.PI] },
			{ len: arc, at: (t) => corner(x + r, y + h - r, Math.PI / 2, t) },
			{ len: sh, at: (t) => [x, y + h - r - t, -Math.PI / 2] },
			{ len: arc, at: (t) => corner(x + r, y + r, Math.PI, t) },
		];
		return {
			length: segments.reduce((sum, seg) => sum + seg.len, 0),
			at(s) {
				for (const seg of segments) {
					if (s <= seg.len) return seg.at(s);
					s -= seg.len;
				}
				return segments[0].at(0);
			},
		};
	}

	function circlePath(cx, cy, r) {
		return {
			length: 2 * Math.PI * r,
			at(s) {
				const a = s / r - Math.PI / 2;
				return [cx + r * Math.cos(a), cy + r * Math.sin(a), a + Math.PI / 2];
			},
		};
	}

	// Lay tesserae of varied length along a path
	function lay(path, rand, row, kind, ring, out) {
		const count = Math.max(1, Math.round(path.length / (row * (0.85 + rand() * 0.25))));
		const step = path.length / count;
		let s = rand() * step;
		for (let i = 0; i < count; i++) {
			const [x, y, angle] = path.at((s + step * 0.5) % path.length);
			out.push({
				x,
				y,
				angle: angle + (rand() - 0.5) * 0.12,
				len: Math.max(row * 0.4, step * (0.82 + rand() * 0.3) - row * 0.17),
				depth: row * (0.81 - rand() * 0.08),
				kind,
				ring,
				shade: rand(),
				tiltX: (rand() - 0.5) * 1.6,
				tiltY: (rand() - 0.5) * 1.6,
			});
			s += step;
		}
	}

	// All sizes derive from the tessera size (row), so every scale looks alike
	function build(seed, W, H, row) {
		const rand = random(seed * 2654435761);
		const tiles = [];

		// Frame band: dark, gold, gold, dark — then the field, ring by ring
		const bands = ["deep", "gold", "gold", "deep"];
		let ring = 0;
		for (; ; ring++) {
			const inset = row / 2 + ring * row;
			const w = W - 2 * inset;
			const h = H - 2 * inset;
			if (w < row || h < row) break;
			const radius = Math.max(0, row * 2.4 - ring * row);
			lay(roundRectPath(inset, inset, w, h, radius), rand, row, bands[ring] || "field", ring, tiles);
		}

		// The rings leave a thin strip in the middle: fill it with straight rows
		const edge = ring * row;
		const restW = W - 2 * edge;
		const restH = H - 2 * edge;
		const lines = Math.round(Math.min(restW, restH) / row);
		const horizontal = restW >= restH;
		for (let i = 0; i < lines; i++) {
			const offset = edge + (i + 0.5) * row;
			const line = horizontal
				? { length: restW, at: (s) => [edge + s, offset + (restH - lines * row) / 2, 0] }
				: { length: restH, at: (s) => [offset + (restW - lines * row) / 2, edge + s, Math.PI / 2] };
			lay(line, rand, row, "field", ring, tiles);
		}

		// The medallion holding the Ω, set over the top band
		const medallion = [];
		const center = [W / 2, row * 3.07];
		lay(circlePath(...center, row * 2.6), rand, row, "gold", 0, medallion);
		lay(circlePath(...center, row * 1.6), rand, row, "deep", 0, medallion);
		lay(circlePath(...center, row * 0.6), rand, row, "deep", 0, medallion);

		return { tiles, medallion, center };
	}

	function hsl([h, s, l], dl = 0, dh = 0) {
		return `hsl(${h + dh} ${s}% ${Math.max(0, Math.min(100, l + dl))}%)`;
	}

	function drawTile(ctx, tile, color) {
		ctx.save();
		ctx.translate(tile.x, tile.y);
		ctx.rotate(tile.angle);
		ctx.fillStyle = color;
		ctx.fillRect(-tile.len / 2, -tile.depth / 2, tile.len, tile.depth);
		ctx.restore();
	}

	// Draws into the canvas at its CSS size, and redraws when that size changes
	function start(canvas, { seed, lang, row = 7.5 }) {
		const theme = THEMES[lang] || THEMES.la;
		const ctx = canvas.getContext("2d");
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let W = 0;
		let H = 0;
		let base = null;
		let gold = [];
		const light = { x: 0, y: 0 };
		let rest = { x: 0, y: 0 };
		let target = rest;
		let raf = 0;

		function layout() {
			const dpr = Math.min(window.devicePixelRatio || 1, 3);
			W = canvas.clientWidth;
			H = canvas.clientHeight;
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const { tiles, medallion, center } = build(seed, W, H, row);
			gold = [];

			// Static layer: grout and every non-gold tessera, drawn once
			base = document.createElement("canvas");
			base.width = canvas.width;
			base.height = canvas.height;
			const b = base.getContext("2d");
			b.setTransform(dpr, 0, 0, dpr, 0, 0);
			b.fillStyle = theme.grout;
			b.fillRect(0, 0, W, H);

			const rings = tiles.reduce((max, t) => Math.max(max, t.ring), 1);
			const paint = (list) => {
				for (const tile of list) {
					if (tile.kind === "gold") {
						gold.push(tile);
						continue;
					}
					// Field calms toward the centre, under the letters
					const calm = tile.kind === "field" ? 1 - 0.65 * (tile.ring / rings) : 1;
					const color =
						tile.kind === "deep"
							? hsl(theme.fieldDeep, (tile.shade - 0.5) * 6)
							: hsl(theme.field, (tile.shade - 0.5) * 9 * calm, (tile.shade - 0.5) * 8 * calm);
					drawTile(b, tile, color);
				}
			};
			paint(tiles);

			// Grout disc under the medallion before its tesserae
			b.fillStyle = theme.grout;
			b.beginPath();
			b.arc(...center, row * 3.13, 0, Math.PI * 2);
			b.fill();
			b.fillStyle = hsl(theme.fieldDeep, 2);
			b.beginPath();
			b.arc(...center, row * 2.07, 0, Math.PI * 2);
			b.fill();
			paint(medallion);

			rest = { x: W * 0.28, y: -H * 0.13 };
			target = rest;
		}

		// Gold tesserae: brightness follows the angle between their tilt and the light
		function frame() {
			ctx.drawImage(base, 0, 0, W, H);
			for (const tile of gold) {
				const dx = light.x - tile.x;
				const dy = light.y - tile.y;
				const d = Math.hypot(dx, dy) || 1;
				const facing = (dx / d) * tile.tiltX + (dy / d) * tile.tiltY; // -1.1 … 1.1
				const glint = Math.max(0, facing) ** 3;
				drawTile(ctx, tile, hsl(GOLD, -14 + facing * 9 + glint * 24 + (tile.shade - 0.5) * 8, (tile.shade - 0.5) * 6 - glint * 6));
			}
		}

		function tick() {
			light.x += (target.x - light.x) * 0.08;
			light.y += (target.y - light.y) * 0.08;
			frame();
			raf = Math.hypot(target.x - light.x, target.y - light.y) > 0.5 ? requestAnimationFrame(tick) : 0;
		}
		function wake() {
			if (still) {
				Object.assign(light, target);
				frame();
			} else if (!raf) {
				raf = requestAnimationFrame(tick);
			}
		}

		// Opening: the light sweeps in from the top-left once and settles
		layout();
		Object.assign(light, { x: -W * 0.25, y: -H * 0.4 });
		frame();
		wake();

		// Redraw at the new size when the window is resized
		let pending = 0;
		new ResizeObserver(() => {
			clearTimeout(pending);
			pending = setTimeout(() => {
				if (canvas.clientWidth === W && canvas.clientHeight === H) return;
				layout();
				Object.assign(light, rest);
				frame();
			}, 120);
		}).observe(canvas);

		// The light sits above the pointer, so glints move with the hand
		window.addEventListener("pointermove", (event) => {
			const rect = canvas.getBoundingClientRect();
			target = { x: event.clientX - rect.left, y: event.clientY - rect.top - H * 0.47 };
			wake();
		});
		document.documentElement.addEventListener("pointerleave", () => {
			target = rest;
			wake();
		});
	}

	return { start };
})();
