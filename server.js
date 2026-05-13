const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const tutorialsPath = path.join(dataDir, "exercise-tutorials.json");
const port = Number(process.env.PORT || 4174);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

async function readTutorials() {
  try {
    const raw = await fs.readFile(tutorialsPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeTutorials(tutorials) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(tutorialsPath, `${JSON.stringify(tutorials, null, 2)}\n`);
}

function cleanVideoId(value) {
  const match = String(value || "").match(/^[a-zA-Z0-9_-]{11}$/);
  return match ? match[0] : "";
}

function parseYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return cleanVideoId(url.pathname.slice(1));
    if (url.pathname.startsWith("/shorts/")) return cleanVideoId(url.pathname.split("/")[2]);
    if (url.pathname.startsWith("/embed/")) return cleanVideoId(url.pathname.split("/")[2]);
    return cleanVideoId(url.searchParams.get("v"));
  } catch {
    return cleanVideoId(value);
  }
}

async function readRequestBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (url.pathname === "/api/tutorials" && request.method === "GET") {
    sendJson(response, 200, await readTutorials());
    return;
  }

  if (url.pathname === "/api/tutorials/auto-fill" && request.method === "POST") {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      sendJson(response, 400, {
        error: "YOUTUBE_API_KEY is required to auto-fill tutorial videos.",
      });
      return;
    }

    const body = await readRequestBody(request);
    const exercises = Array.isArray(body.exercises) ? body.exercises : [];
    const tutorials = await readTutorials();
    const added = [];
    const skipped = [];

    for (const exercise of exercises) {
      const slug = String(exercise.slug || "");
      if (!slug || tutorials[slug]?.videoId) {
        skipped.push({ slug, reason: "already has tutorial" });
        continue;
      }

      const video = await findYouTubeTutorial(apiKey, exercise);
      if (!video?.videoId) {
        skipped.push({ slug, reason: "no video found" });
        continue;
      }

      tutorials[slug] = {
        videoId: video.videoId,
        source: "youtube",
        title: video.title,
        channelTitle: video.channelTitle,
        searchQuery: video.searchQuery,
        autoFilled: true,
        updatedAt: new Date().toISOString(),
      };
      added.push({ slug, ...tutorials[slug] });
    }

    await writeTutorials(tutorials);
    sendJson(response, 200, { added, skipped, tutorials });
    return;
  }

  const tutorialMatch = url.pathname.match(/^\/api\/tutorials\/([a-z0-9-]+)$/);
  if (tutorialMatch && request.method === "PUT") {
    const slug = tutorialMatch[1];
    const body = await readRequestBody(request);
    const videoId = parseYouTubeVideoId(body.videoId || body.url);
    const tutorials = await readTutorials();

    if (!videoId) {
      delete tutorials[slug];
      await writeTutorials(tutorials);
      sendJson(response, 200, { slug, videoId: "" });
      return;
    }

    tutorials[slug] = {
      videoId,
      source: "youtube",
      updatedAt: new Date().toISOString(),
    };
    await writeTutorials(tutorials);
    sendJson(response, 200, { slug, ...tutorials[slug] });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function findYouTubeTutorial(apiKey, exercise) {
  const name = String(exercise.name || "").trim();
  const query = String(exercise.query || name).trim();
  if (!name && !query) return null;

  const searchQuery = `${query || name} exercise tutorial proper form`;
  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    maxResults: "5",
    videoEmbeddable: "true",
    safeSearch: "strict",
    q: searchQuery,
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!response.ok) return null;
  const payload = await response.json();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const best = items.find((item) => item?.id?.videoId);
  if (!best) return null;

  return {
    videoId: best.id.videoId,
    title: best.snippet?.title || name,
    channelTitle: best.snippet?.channelTitle || "",
    searchQuery,
  };
}

async function serveStatic(request, response, url) {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    await serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`PulsePlan running at http://127.0.0.1:${port}`);
});
