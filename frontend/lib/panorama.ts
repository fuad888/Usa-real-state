/**
 * Placeholder equirectangular panoramas, drawn in a canvas at runtime.
 *
 * The demo has no 360° photography yet, but the tour itself must be fully
 * walkable for the pitch (spec §19). So each scene gets a generated 2:1
 * equirectangular image in the brand palette, with a horizon, wall divisions
 * that give you something to track while dragging, and the room name repeated
 * at the four cardinal bearings so you can tell which way you are facing.
 *
 * Phase 1: upload real panoramas in the admin (`PropertyTour.panorama_file`)
 * and this is never called.
 */

const ROOM_TONES: Record<string, { wall: string; floor: string; ceiling: string }> = {
  "living-room": { wall: "#D9D0C2", floor: "#8A6B4B", ceiling: "#EFEAE1" },
  kitchen: { wall: "#DCD6CA", floor: "#B3AB9D", ceiling: "#F1EDE6" },
  "primary-suite": { wall: "#D6CEC6", floor: "#94714E", ceiling: "#EEE9E2" },
  terrace: { wall: "#A8BCC7", floor: "#C0B7A6", ceiling: "#7EA0BC" },
};

export function generatePanorama(sceneId: string, roomName: string): string {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const tone = ROOM_TONES[sceneId] ?? { wall: "#D8D0C4", floor: "#9A826E", ceiling: "#EFEAE1" };
  const outdoors = sceneId === "terrace";

  // Ceiling / sky
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.42);
  top.addColorStop(0, outdoors ? "#5E86AE" : tone.ceiling);
  top.addColorStop(1, tone.wall);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.42);

  // Wall band
  ctx.fillStyle = tone.wall;
  ctx.fillRect(0, H * 0.42, W, H * 0.16);

  // Floor / ground
  const bottom = ctx.createLinearGradient(0, H * 0.58, 0, H);
  bottom.addColorStop(0, tone.floor);
  bottom.addColorStop(1, outdoors ? "#8E9C86" : "#4C3A28");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);

  // Horizon
  ctx.strokeStyle = "rgba(28,27,25,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.5);
  ctx.lineTo(W, H * 0.5);
  ctx.stroke();

  // Vertical divisions — openings indoors, posts outdoors. These give the eye
  // something to follow while dragging, so the viewer reads as interactive.
  const bays = 8;
  for (let i = 0; i < bays; i++) {
    const x = (i / bays) * W;
    ctx.fillStyle = "rgba(28,27,25,0.07)";
    ctx.fillRect(x, H * 0.24, 8, H * 0.26);
    if (i % 2 === 0) {
      ctx.fillStyle = outdoors ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.42)";
      ctx.fillRect(x + 26, H * 0.28, W / bays - 60, H * 0.2);
    }
  }

  // Room name at the four cardinal bearings
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 4; i++) {
    const x = (i / 4) * W + W / 8;
    ctx.fillStyle = "rgba(28,27,25,0.24)";
    ctx.font = "500 17px Georgia, serif";
    ctx.fillText(roomName.toUpperCase(), x, H * 0.44);
    ctx.fillStyle = "rgba(28,27,25,0.14)";
    ctx.font = "500 10px system-ui, sans-serif";
    ctx.fillText("PLACEHOLDER · SOL & STONE", x, H * 0.465);
  }

  // Soft vignette toward the poles, where equirectangular stretching is worst
  const pole = ctx.createLinearGradient(0, 0, 0, H);
  pole.addColorStop(0, "rgba(28,27,25,0.3)");
  pole.addColorStop(0.25, "rgba(28,27,25,0)");
  pole.addColorStop(0.75, "rgba(28,27,25,0)");
  pole.addColorStop(1, "rgba(28,27,25,0.35)");
  ctx.fillStyle = pole;
  ctx.fillRect(0, 0, W, H);

  return canvas.toDataURL("image/jpeg", 0.82);
}
