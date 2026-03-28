function wrapPlainLine(text, width) {
  const input = String(text ?? "");
  if (width <= 0) {
    return [""];
  }

  if (input.length === 0) {
    return [""];
  }

  const out = [];
  let line = "";

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (ch === "\n") {
      out.push(line);
      line = "";
      continue;
    }

    line += ch;
    if (line.length >= width) {
      out.push(line);
      line = "";
    }
  }

  if (line.length > 0 || out.length === 0) {
    out.push(line);
  }

  return out;
}

function wrapPlain(text, width) {
  const rows = String(text ?? "").split("\n");
  const out = [];

  for (const row of rows) {
    out.push(...wrapPlainLine(row, width));
  }

  return out.length > 0 ? out : [""];
}

function clampInt(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptions(args) {
  const options = {
    cols: null,
    rows: null,
    iter: 25,
    zoom: 0.75,
    cx: -0.75,
    cy: 0,
    aspect: 2,
    palette: "ascii",
    color: false,
    colorTheme: "aurora",
    charset: "",
    invert: false,
    help: false
  };

  const errors = [];

  for (let i = 1; i < args.length; i += 1) {
    const token = String(args[i] ?? "").trim();
    if (token.length === 0) {
      continue;
    }

    if (token === "--help" || token === "-?" || token === "-help") {
      options.help = true;
      continue;
    }

    if (token === "--invert") {
      options.invert = true;
      continue;
    }

    if (token === "--color") {
      options.color = true;
      const next = String(args[i + 1] ?? "").trim().toLowerCase();
      if (next.length > 0 && !next.startsWith("-")) {
        options.colorTheme = next;
        i += 1;
      }
      continue;
    }

    const readValue = () => {
      if (i + 1 >= args.length) {
        errors.push(`Missing value for ${token}.`);
        return null;
      }

      i += 1;
      return String(args[i] ?? "").trim();
    };

    if (token === "--cols" || token === "-w") {
      const next = readValue();
      if (next !== null) {
        options.cols = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--rows" || token === "-h") {
      const next = readValue();
      if (next !== null) {
        options.rows = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--iter" || token === "-i") {
      const next = readValue();
      if (next !== null) {
        options.iter = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--zoom" || token === "-z") {
      const next = readValue();
      if (next !== null) {
        options.zoom = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--cx") {
      const next = readValue();
      if (next !== null) {
        options.cx = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--cy") {
      const next = readValue();
      if (next !== null) {
        options.cy = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--aspect") {
      const next = readValue();
      if (next !== null) {
        options.aspect = parseNumber(next, NaN);
      }
      continue;
    }

    if (token === "--palette" || token === "-p") {
      const next = readValue();
      if (next !== null) {
        options.palette = String(next).toLowerCase();
      }
      continue;
    }

    if (token === "--charset") {
      const next = readValue();
      if (next !== null) {
        options.charset = next;
      }
      continue;
    }

    errors.push(`Unknown option: ${token}`);
  }

  if (options.cols !== null && !Number.isFinite(options.cols)) {
    errors.push("Invalid --cols value.");
  }

  if (options.rows !== null && !Number.isFinite(options.rows)) {
    errors.push("Invalid --rows value.");
  }

  if (!Number.isFinite(options.iter) || options.iter < 1) {
    errors.push("--iter must be >= 1.");
  }

  if (!Number.isFinite(options.zoom) || options.zoom <= 0) {
    errors.push("--zoom must be > 0.");
  }

  if (!Number.isFinite(options.cx) || !Number.isFinite(options.cy)) {
    errors.push("--cx and --cy must be finite numbers.");
  }

  if (!Number.isFinite(options.aspect) || options.aspect <= 0) {
    errors.push("--aspect must be > 0.");
  }

  return { options, errors };
}

function getPalette(options) {
  if (typeof options.charset === "string" && options.charset.length >= 2) {
    return options.charset;
  }

  const palettes = {
    ascii: " .,:;ox%#@",
    classic: " 123456789abcdefghijklmnopqrstuvwxyz*",
    dense: " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
  };

  return palettes[options.palette] ?? palettes.ascii;
}

function getViewportSize(ctx, widthOverride, heightOverride) {
  const cols = Math.max(1, Math.trunc(ctx.tty.window_width || 80));
  const rows = Math.max(1, Math.trunc(ctx.tty.window_height || 24));

  const titleHeight = ctx.state.titleEnabled
    ? wrapPlain(ctx.app.getTitleLine(), cols).length
    : 0;
  const inputHeight = Math.min(rows, Math.max(1, wrapPlain(ctx.state.prompt, cols).length));
  const bufferRows = Math.max(0, rows - titleHeight - inputHeight);

  const renderCols = widthOverride === null
    ? cols
    : clampInt(widthOverride, 1, cols);
  const renderRows = heightOverride === null
    ? bufferRows
    : clampInt(heightOverride, 1, bufferRows || 1);

  return {
    cols: renderCols,
    rows: renderRows,
    maxRows: bufferRows
  };
}

function renderMandelbrot(cols, rows, options, palette) {
  if (rows <= 0 || cols <= 0) {
    return "";
  }

  const maxIter = clampInt(options.iter, 1, 20000);
  const zoom = options.zoom;
  const cx = options.cx;
  const cy = options.cy;
  const aspect = options.aspect;
  const chars = String(palette);
  const maxIndex = Math.max(0, chars.length - 1);

  const xSpan = 3.5 / zoom;
  const ySpan = xSpan * (rows / cols) * aspect;
  const xStart = cx - xSpan / 2;
  const yStart = cy + ySpan / 2;

  const out = new Array(rows);
  const colorRamps = {
    aurora: [39, 45, 51, 50, 49, 48, 118, 154, 190, 226],
    fire: [17, 53, 88, 124, 160, 196, 202, 208, 214, 220],
    ocean: [17, 18, 19, 20, 21, 27, 33, 39, 45, 51],
    neon: [93, 99, 105, 111, 117, 123, 159, 195, 225, 219]
  };
  const ramp = colorRamps[options.colorTheme] ?? colorRamps.aurora;

  const applyColor = (char, index, inside) => {
    if (!options.color) {
      return char;
    }

    if (inside) {
      return `\u001b[38;5;16m${char}\u001b[0m`;
    }

    if (ramp.length === 0) {
      return char;
    }

    const rampIndex = maxIndex <= 0
      ? 0
      : Math.floor((index / maxIndex) * (ramp.length - 1));
    const code = ramp[Math.max(0, Math.min(ramp.length - 1, rampIndex))];
    return `\u001b[38;5;${code}m${char}\u001b[0m`;
  };

  for (let y = 0; y < rows; y += 1) {
    let line = "";
    const imag = yStart - (y / Math.max(1, rows - 1)) * ySpan;

    for (let x = 0; x < cols; x += 1) {
      const real = xStart + (x / Math.max(1, cols - 1)) * xSpan;

      let zr = 0;
      let zi = 0;
      let iter = 0;

      while (zr * zr + zi * zi <= 4 && iter < maxIter) {
        const nextR = zr * zr - zi * zi + real;
        zi = 2 * zr * zi + imag;
        zr = nextR;
        iter += 1;
      }

      let index;
      const inside = iter >= maxIter;
      if (iter >= maxIter) {
        index = options.invert ? maxIndex : 0;
      } else if (maxIndex <= 0) {
        index = 0;
      } else {
        index = Math.floor((iter / maxIter) * maxIndex);
        if (options.invert) {
          index = maxIndex - index;
        }
      }

      const ch = chars[Math.max(0, Math.min(maxIndex, index))] ?? " ";
      line += applyColor(ch, index, inside);
    }

    out[y] = line;
  }

  return out.join("\n");
}

function usage() {
  return (
    "Usage: mandelbrot [options]\n" +
    "Options:\n" +
    "  --cols, -w <n>      output columns (defaults to viewport width)\n" +
    "  --rows, -h <n>      output rows (defaults to visible buffer rows)\n" +
    "  --iter, -i <n>      max iterations (default: 25)\n" +
    "  --zoom, -z <n>      zoom factor > 0 (default: 0.75)\n" +
    "  --cx <n>            center X in complex plane (default: -0.75)\n" +
    "  --cy <n>            center Y in complex plane (default: 0)\n" +
    "  --aspect <n>        terminal cell aspect correction (default: 2)\n" +
    "  --palette, -p <id>  ascii | classic | dense (default: ascii)\n" +
    "  --color [theme]     enable ANSI color (aurora|fire|ocean|neon)\n" +
    "  --charset <chars>   custom character ramp (at least 2 chars)\n" +
    "  --invert            invert ramp mapping\n" +
    "  --help              show this usage"
  );
}

module.exports = {
  cmd: async (ctx, args) => {
    // Wait one tick so input is cleared before viewport height is measured.
    await new Promise((resolve) => setImmediate(resolve));

    const { options, errors } = parseOptions(args);
    if (options.help) {
      return usage();
    }

    if (errors.length > 0) {
      return `${errors.join(" ")}\n${usage()}`;
    }

    const viewport = getViewportSize(ctx, options.cols, options.rows);
    if (viewport.maxRows <= 0) {
      return "No visible buffer rows available to draw Mandelbrot.";
    }

    const palette = getPalette(options);
    const frame = renderMandelbrot(viewport.cols, viewport.rows, options, palette);

    // Write without timestamps to keep the art aligned and clean.
    ctx.app.writeLog(frame, { timestamp: false });
    return "";
  },
  help:
    "mandelbrot                - draw Mandelbrot in visible buffer viewport\n" +
    "mandelbrot [options]      - options: --iter --zoom --cx --cy --palette --color --cols --rows",
  group: "Graphics"
};