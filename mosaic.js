// Draws the popup background as a Ravenna-style mosaic.
// Tesserae are laid in rings that follow the frame inward (the mosaicist's
// "andamento"), so the field calms down around the locution. Gold tesserae
// are set at slight tilts and catch the light as the pointer moves.

const Mosaic = (() => {
	const W = 320;
	const H = 300;
	const ROW = 7.5; // distance between rings of tesserae

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
		function corner(cx, cy, start, t) {
			const a = start + (r ? t / r : 0);
			return [cx + r * Math.cos(a), cy + r * Math.sin(a), a + Math.PI / 2];
		}
		const length = segments.reduce((sum, seg) => sum + seg.len, 0);
		return {
			length,
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
	function lay(path, rand, kind, out) {
		const count = Math.max(1, Math.round(path.length / (ROW * (0.85 + rand() * 0.25))));
		const step = path.length / count;
		let s = rand() * step;
		for (let i = 0; i < count; i++) {
			const len = step * (0.82 + rand() * 0.3);
			const [x, y, angle] = path.at((s + step * 0.5) % path.length);
			out.push({
				x,
				y,
				angle: angle + (rand() - 0.5) * 0.12,
				len: Math.max(3, len - 1.3),
				depth: ROW - 1.4 - rand() * 0.6,
				kind,
				shade: rand(),
				tiltX: (rand() - 0.5) * 1.6,
				tiltY: (rand() - 0.5) * 1.6,
			});
			s += step;
		}
	}

	function build(seed) {
		const rand = random(seed * 2654435761);
		const tiles = [];

		// Frame band: dark, gold, gold, dark — then the field, ring by ring
		const bands = ["deep", "gold", "gold", "deep"];
		for (let ring = 0; ; ring++) {
			const inset = ROW / 2 + ring * ROW;
			const w = W - 2 * inset;
			const h = H - 2 * inset;
			if (w < ROW || h < ROW) break;
			const first = tiles.length;
			lay(roundRectPath(inset, inset, w, h, Math.max(0, 18 - ring * ROW)), rand, bands[ring] || "field", tiles);
			for (let i = first; i < tiles.length; i++) tiles[i].ring = ring;
		}

		// The medallion holding the Ω, set over the top band
		const medallion = [];
		const cx = W / 2;
		const cy = 23;
		lay(circlePath(cx, cy, 19.5), rand, "gold", medallion);
		lay(circlePath(cx, cy, 12), rand, "deep", medallion);
		lay(circlePath(cx, cy, 4.5), rand, "deep", medallion);

		return { tiles, medallion, center: [cx, cy] };
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

	function start(canvas, { seed, lang }) {
		const theme = THEMES[lang] || THEMES.la;
		const dpr = Math.min(window.devicePixelRatio || 1, 3);
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		const ctx = canvas.getContext("2d");
		ctx.scale(dpr, dpr);

		const { tiles, medallion, center } = build(seed);
		const gold = [];

		// Static layer: grout and every non-gold tessera, drawn once
		const base = document.createElement("canvas");
		base.width = canvas.width;
		base.height = canvas.height;
		const b = base.getContext("2d");
		b.scale(dpr, dpr);
		b.fillStyle = theme.grout;
		b.fillRect(0, 0, W, H);

		const rings = tiles.reduce((max, t) => Math.max(max, t.ring), 0);
		const paint = (list) => {
			for (const tile of list) {
				if (tile.kind === "gold") {
					gold.push(tile);
					continue;
				}
				// Field calms toward the centre, under the letters
				const calm = tile.kind === "field" ? 1 - 0.65 * ((tile.ring || 0) / Math.max(1, rings)) : 1;
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
		b.arc(center[0], center[1], 23.5, 0, Math.PI * 2);
		b.fill();
		b.fillStyle = hsl(theme.fieldDeep, 2);
		b.beginPath();
		b.arc(center[0], center[1], 15.5, 0, Math.PI * 2);
		b.fill();
		paint(medallion);

		// Gold tesserae: brightness follows the angle between their tilt and the light
		const light = { x: -80, y: -120 };
		const rest = { x: W * 0.28, y: -40 };
		let target = { ...rest };

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

		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (still) {
			Object.assign(light, rest);
			frame();
			return;
		}

		let raf = 0;
		function tick() {
			light.x += (target.x - light.x) * 0.08;
			light.y += (target.y - light.y) * 0.08;
			frame();
			raf = Math.hypot(target.x - light.x, target.y - light.y) > 0.5 ? requestAnimationFrame(tick) : 0;
		}
		const wake = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};

		// Opening: the light sweeps in once and settles
		frame();
		wake();

		const panel = canvas.parentElement;
		panel.addEventListener("pointermove", (event) => {
			const rect = panel.getBoundingClientRect();
			// The light sits above the panel, mirrored so glints move with the hand
			target = { x: event.clientX - rect.left, y: event.clientY - rect.top - 140 };
			wake();
		});
		panel.addEventListener("pointerleave", () => {
			target = { ...rest };
			wake();
		});
	}

	return { start };
})();
