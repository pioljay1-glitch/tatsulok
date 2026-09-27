const RAW =
  "https://raw.githubusercontent.com/RomanMdesign/TATSULOK/main/public/assets";

export function asset(file) {
  return `${RAW}/${file}`;
}

export const CHARACTER_AUDIO = {
  peyudo: asset("peyudo.mp3"),
  misteryo: asset("misteryo.mp3"),
  bangag: asset("bangag.mp3"),
  pula: asset("pula.wav"),
  tanikala: asset("tanikala.mp3"),
  tisa: asset("tisa.mp3")
};
